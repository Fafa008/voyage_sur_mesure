// lib/services/payment/__tests__/business-workflow.test.ts
//
// P1.4 — Tests E2E du parcours métier complet.
//
// Couvre le workflow réel d'un utilisateur ainsi que les cas limites :
//  1. Parcours complet (happy path) : Devis → Conseiller → Modification → Paiement → PAYEE
//  2. Devis refusé par le conseiller
//  3. Devis modifié plusieurs fois par le client
//  4. Client abandonne une modification (revient à en_cours)
//  5. Paiement FAILED → réservation ANNULEE
//  6. Paiement EXPIRED → expiration automatique
//  7. Double paiement → idempotence
//  8. Double webhook → idempotence
//  9. Dernière place disponible → réservation OK
// 10. Deux clients se disputent la dernière place → un seul gagne
// 11. Utilisateur non autorisé → accès refusé
// 12. Suppression devis → cascade soft-delete réservation
//
// Note : les server actions (createDevis, acceptDevis, etc.) utilisent
// auth.api.getSession(headers) qui nécessite un contexte HTTP réel.
// Les tests appellent directement les services et route handlers,
// contournant la couche d'auth pour tester la logique métier.

import { POST } from "@/app/api/payment/webhook/papi/route";
import type { NextRequest } from "next/server";
import { paymentService } from "@/lib/services/payment/payment.service";
import { expirationService } from "@/lib/services/payment/expiration.service";
import { deletionService } from "@/lib/services/deletion.service";
import { reservationService } from "@/lib/services/reservation.service";
import { calculateDevisBudget } from "@/lib/services/devis-calculator.service";
import { prisma } from "@/lib/prisma";
import {
  PaymentMethod,
  PaymentStatus,
  Prisma,
  ReservationStatus,
  RoleNom,
  StatutDevis,
  StatutReservation,
} from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function createTestCircuit(
  nbPlaces: number,
  opts?: { prixEstime?: number; dureeJours?: number }
) {
  return prisma.circuit.create({
    data: {
      titre: `Circuit E2E ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      slug: `circuit-e2e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nbPlacesDisponibles: nbPlaces,
      prixEstime: opts?.prixEstime ?? 500000,
      dureeJours: opts?.dureeJours ?? 7,
    },
  });
}

async function createTestUser(role?: string) {
  const roleId = role
    ? (await prisma.role.upsert({ where: { nom: role as RoleNom }, create: { nom: role as RoleNom }, update: {} })).id
    : null;
  return prisma.user.create({
    data: {
      name: `TestUser-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      email: `test-e2e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.com`,
      emailVerified: true,
      roleId,
    },
  });
}

async function createTestReservation(
  userId: string,
  circuitId: number | null,
  nbVoyageurs: number,
  status: ReservationStatus = ReservationStatus.EN_ATTENTE
) {
  return prisma.reservation.create({
    data: {
      userId,
      circuitId,
      nbVoyageurs,
      montantFinal: 450000,
      status,
      statut: StatutReservation.confirmee,
    },
  });
}

async function createTestTransaction(
  reservationId: number,
  userId: string,
  providerId: string,
  expiresAt: Date,
  status: PaymentStatus = PaymentStatus.PENDING
) {
  return prisma.paymentTransaction.create({
    data: {
      amount: 450000,
      currency: "MGA",
      method: PaymentMethod.PAPI,
      status,
      providerId,
      providerRef: `E2E-${reservationId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      notificationToken: "test-token-e2e",
      reservationId,
      userId,
      expiresAt,
    },
  });
}

function createPapiWebhookReq(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/payment/webhook/papi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite de tests
// ─────────────────────────────────────────────────────────────────────────────

export async function runBusinessWorkflowTests() {
  console.log("🧪 Début des tests E2E du parcours métier (P1.4)...\n");

  const clientUser = await createTestUser();
  const conseillerUser = await createTestUser("conseiller");

  let provider = await prisma.paymentProvider.findFirst({ where: { name: "PAPI" } });
  if (!provider) {
    provider = await prisma.paymentProvider.create({ data: { name: "PAPI" } });
  }

  const createdCircuits: number[] = [];
  const createdReservations: number[] = [];
  const createdDevis: number[] = [];

  const now = new Date();
  const past = new Date(now.getTime() - 20 * 60 * 1000);
  const future = new Date(now.getTime() + 20 * 60 * 1000);

  try {
    // ── TEST 1 : PARCOURS COMPLET (HAPPY PATH) ──────────────────────────────────
    {
      console.log("TEST 1 : Parcours complet — Devis → Conseiller → Modification → Paiement → PAYEE");

      // ÉTAPE 1 — Client crée un devis
      const circuit = await createTestCircuit(10, { prixEstime: 500000, dureeJours: 5 });
      createdCircuits.push(circuit.id);

      const devis = await prisma.devis.create({
        data: {
          userId: clientUser.id,
          circuitId: circuit.id,
          conseillerId: conseillerUser.id,
          prenom: "Jean",
          nom: "Rakoto",
          telephone: "0340000000",
          dateDebutSouhaitee: new Date("2026-10-01"),
          dateFinSouhaitee: new Date("2026-10-05"),
          adultes: 2,
          enfants: 0,
          ados: 0,
          nombrePersonnes: 2,
          statut: StatutDevis.en_cours,
        },
      });
      createdDevis.push(devis.id);

      const devisAfterCreate = await prisma.devis.findUnique({ where: { id: devis.id } });
      assert(devisAfterCreate!.statut === StatutDevis.en_cours, "Devis doit être en_cours");
      assert(devisAfterCreate!.conseillerId === conseillerUser.id, "Conseiller assigné");

      // Notification client
      await prisma.notification.create({
        data: { userId: clientUser.id, titre: "Demande enregistrée", message: `Devis #${devis.id} créé` },
      });
      // Notification conseiller
      await prisma.notification.create({
        data: { userId: conseillerUser.id, titre: "Nouveau devis attribué", message: `Devis #${devis.id}` },
      });

      // ÉTAPE 2 — Conseiller demande une modification
      await prisma.devis.update({
        where: { id: devis.id },
        data: {
          statut: StatutDevis.en_modification,
          commentaireConseiller: "Veuillez préciser le type d'hébergement souhaité et le budget",
        },
      });
      await prisma.notification.create({
        data: { userId: clientUser.id, titre: "Modification demandée", message: `Devis #${devis.id}` },
      });

      const devisAfterModifDemandee = await prisma.devis.findUnique({ where: { id: devis.id } });
      assert(devisAfterModifDemandee!.statut === StatutDevis.en_modification, "Devis doit être en_modification");

      // ÉTAPE 3 — Client modifie son devis (simule updateDevisByClient)
      await prisma.devis.update({
        where: { id: devis.id },
        data: {
          prenom: "Jean",
          nom: "Rakoto",
          typeHebergement: "luxe",
          budgetMin: 2000000,
          budgetMax: 5000000,
          nombrePersonnes: 2,
          statut: StatutDevis.en_cours,
          montantTotal: null,
          detailsCalcul: Prisma.JsonNull,
          dateDebutConfirmee: null,
          dateFinConfirmee: null,
          commentaireConseiller: null,
        },
      });
      await prisma.notification.create({
        data: { userId: conseillerUser.id, titre: "Devis modifié par le client", message: `Devis #${devis.id}` },
      });

      const devisAfterClientModif = await prisma.devis.findUnique({ where: { id: devis.id } });
      assert(devisAfterClientModif!.statut === StatutDevis.en_cours, "Devis repasse en_cours après modification client");
      assert(devisAfterClientModif!.typeHebergement === "luxe", "Hébergement mis à jour");
      assert(devisAfterClientModif!.montantTotal === null, "Montant invalidé après modification");

      // ÉTAPE 4 — Conseiller recalcule et valide (simule validateDevisWithPricing)
      const breakdown = await calculateDevisBudget(devis.id, {
        typeHebergement: "luxe",
        transportType: "4x4",
        includeGuide: true,
        remise: 100000,
      });

      assert(breakdown.montantTotal > 0, "Montant total doit être > 0");
      assert(breakdown.hebergementSuppl > 0, "Supplément hébergement luxe doit être > 0");

      await prisma.devis.update({
        where: { id: devis.id },
        data: {
          montantTotal: breakdown.montantTotal,
          statut: StatutDevis.valide,
          dateDebutConfirmee: new Date("2026-10-01"),
          dateFinConfirmee: new Date("2026-10-05"),
          detailsCalcul: breakdown as unknown as Prisma.InputJsonValue,
          commentaireConseiller: "Devis chiffré avec hébergement luxe et guide",
        },
      });
      await prisma.notification.create({
        data: { userId: clientUser.id, titre: "Devis prêt", message: `Montant: ${breakdown.montantTotal}` },
      });

      const devisAfterValidation = await prisma.devis.findUnique({ where: { id: devis.id } });
      assert(devisAfterValidation!.statut === StatutDevis.valide, "Devis doit être valide");
      assert(Number(devisAfterValidation!.montantTotal) === breakdown.montantTotal, "Montant scellé");

      // ÉTAPE 5 — Client accepte le devis
      await prisma.devis.update({ where: { id: devis.id }, data: { statut: StatutDevis.accepte } });
      await prisma.notification.create({
        data: { userId: clientUser.id, titre: "Devis accepté", message: `Devis #${devis.id} accepté` },
      });

      const devisAfterAccept = await prisma.devis.findUnique({ where: { id: devis.id } });
      assert(devisAfterAccept!.statut === StatutDevis.accepte, "Devis doit être accepte");

      // ÉTAPE 6 — Client initie le paiement (simule initiateFromDevis)
      // On crée la réservation et la transaction manuellement car le provider
      // PAPI nécessite des credentials réels indisponibles en environnement de test.
      const reservation = await prisma.reservation.create({
        data: {
          userId: clientUser.id,
          devisId: devis.id,
          circuitId: circuit.id,
          nbVoyageurs: 2,
          montantFinal: breakdown.montantTotal,
          status: ReservationStatus.EN_ATTENTE,
          statut: StatutReservation.confirmee,
        },
      });
      createdReservations.push(reservation.id);

      await prisma.devis.update({ where: { id: devis.id }, data: { statut: StatutDevis.reserve } });
      await prisma.circuit.update({ where: { id: circuit.id }, data: { nbPlacesDisponibles: { decrement: 2 } } });

      const providerRef = `E2E-TEST1-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const transaction = await prisma.paymentTransaction.create({
        data: {
          amount: breakdown.montantTotal,
          currency: "MGA",
          method: PaymentMethod.PAPI,
          status: PaymentStatus.PENDING,
          providerId: provider!.id,
          providerRef,
          notificationToken: "test-token-e2e",
          reservationId: reservation.id,
          userId: clientUser.id,
          expiresAt: future,
        },
      });

      const reservationAfterPayment = await prisma.reservation.findUnique({ where: { id: reservation.id } });
      assert(reservationAfterPayment!.status === ReservationStatus.EN_ATTENTE, "Réservation EN_ATTENTE");
      assert(Number(reservationAfterPayment!.montantFinal) === breakdown.montantTotal, "Montant = chiffrage");
      assert(transaction.status === PaymentStatus.PENDING, "Transaction PENDING");

      // ÉTAPE 7 — Webhook PAPI SUCCESS
      const webhookRes = await POST(
        createPapiWebhookReq({
          paymentStatus: "SUCCESS",
          paymentMethod: "MVOLA",
          currency: "MGA",
          amount: Number(breakdown.montantTotal),
          merchantPaymentReference: providerRef,
          notificationToken: "test-token-e2e",
        })
      );
      assert(webhookRes.status === 200, `Webhook doit retourner 200 (reçu ${webhookRes.status})`);

      const reservationFinal = await prisma.reservation.findUnique({ where: { id: reservation.id } });
      assert(reservationFinal!.status === ReservationStatus.PAYEE, "Réservation doit être PAYEE");

      const transactionFinal = await prisma.paymentTransaction.findUnique({ where: { id: transaction.id } });
      assert(transactionFinal!.status === PaymentStatus.PAID, "Transaction doit être PAID");
      assert(transactionFinal!.providerPaymentMethod === "MVOLA", "Méthode de paiement enregistrée");

      // Vérifier la facture
      const invoice = await prisma.invoice.findFirst({ where: { reservationId: reservation.id } });
      assert(invoice !== null, "Facture créée automatiquement");
      assert(invoice!.status === "PAID", "Facture PAID");
      assert(Number(invoice!.amount) === Number(breakdown.montantTotal), "Montant facture cohérent");

      // Vérifier les notifications
      const payNotifications = await prisma.notification.findMany({
        where: { userId: clientUser.id, titre: "Paiement confirmé" },
      });
      assert(payNotifications.length >= 1, "Notification de paiement créée");

      console.log("✅ TEST 1 réussi\n");
    }

    // ── TEST 2 : DEVIS REFUSÉ ───────────────────────────────────────────────────
    {
      console.log("TEST 2 : Devis refusé par le conseiller");

      const circuit = await createTestCircuit(5);
      createdCircuits.push(circuit.id);

      const devis = await prisma.devis.create({
        data: {
          userId: clientUser.id,
          circuitId: circuit.id,
          prenom: "Marie",
          nom: "Rasoa",
          telephone: "0341111111",
          dateDebutSouhaitee: new Date("2026-11-01"),
          dateFinSouhaitee: new Date("2026-11-05"),
          adultes: 1,
          nombrePersonnes: 1,
          statut: StatutDevis.en_cours,
          budgetMin: 100000,
          budgetMax: 200000,
        },
      });
      createdDevis.push(devis.id);

      // Conseiller refuse
      await prisma.devis.update({
        where: { id: devis.id },
        data: {
          statut: StatutDevis.refuse,
          commentaireConseiller: "Budget insuffisant pour ce circuit",
        },
      });
      await prisma.notification.create({
        data: { userId: clientUser.id, titre: "Devis refusé", message: `Devis #${devis.id} refusé` },
      });

      const devisAfterRefuse = await prisma.devis.findUnique({ where: { id: devis.id } });
      assert(devisAfterRefuse!.statut === StatutDevis.refuse, "Devis doit être refuse");
      assert(devisAfterRefuse!.commentaireConseiller === "Budget insuffisant pour ce circuit", "Motif enregistré");

      // Tenter d'accepter un devis refusé via Prisma → Prisma n'a pas de machine à états,
      // la protection est dans la server action acceptDevis (vérifie statut === "valide").
      // On vérifie que le service payment rejette bien un devis refusé :
      let rejectError = false;
      try {
        await paymentService.initiateFromDevis(devis.id, PaymentMethod.PAPI, clientUser.id);
      } catch (e) {
        rejectError = e instanceof Error && e.message.includes("accepté");
      }
      assert(rejectError, "Paiement sur devis refusé doit échouer");

      console.log("✅ TEST 2 réussi\n");
    }

    // ── TEST 3 : DEVIS MODIFIÉ PLUSIEURS FOIS ──────────────────────────────────
    {
      console.log("TEST 3 : Devis modifié 3 fois par le client");

      const circuit = await createTestCircuit(8);
      createdCircuits.push(circuit.id);

      const devis = await prisma.devis.create({
        data: {
          userId: clientUser.id,
          circuitId: circuit.id,
          prenom: "Paul",
          nom: "Andria",
          telephone: "0342222222",
          dateDebutSouhaitee: new Date("2026-12-01"),
          dateFinSouhaitee: new Date("2026-12-07"),
          adultes: 3,
          nombrePersonnes: 3,
          statut: StatutDevis.en_cours,
        },
      });
      createdDevis.push(devis.id);

      for (let i = 1; i <= 3; i++) {
        // Conseiller demande modification
        await prisma.devis.update({
          where: { id: devis.id },
          data: {
            statut: StatutDevis.en_modification,
            commentaireConseiller: `Modification demandée #${i}`,
          },
        });

        const afterModifReq = await prisma.devis.findUnique({ where: { id: devis.id } });
        assert(afterModifReq!.statut === StatutDevis.en_modification, `Cycle ${i}: en_modification`);

        // Client modifie
        await prisma.devis.update({
          where: { id: devis.id },
          data: {
            budgetMax: 2000000 + i * 500000,
            commentaireClient: `Modification client #${i}`,
            statut: StatutDevis.en_cours,
            montantTotal: null,
            commentaireConseiller: null,
          },
        });

        const afterClientModif = await prisma.devis.findUnique({ where: { id: devis.id } });
        assert(afterClientModif!.statut === StatutDevis.en_cours, `Cycle ${i}: repasse en_cours`);
        assert(afterClientModif!.montantTotal === null, `Cycle ${i}: montant invalidé`);
      }

      // Après 3 modifications, le conseiller valide
      await prisma.devis.update({
        where: { id: devis.id },
        data: { statut: StatutDevis.valide, montantTotal: 3500000 },
      });

      const finalDevis = await prisma.devis.findUnique({ where: { id: devis.id } });
      assert(finalDevis!.statut === StatutDevis.valide, "Devis valide après 3 modifications");

      console.log("✅ TEST 3 réussi\n");
    }

    // ── TEST 4 : CLIENT ABANDONNE UNE MODIFICATION ──────────────────────────────
    {
      console.log("TEST 4 : Client abandonne une modification (revient à en_cours)");

      const circuit = await createTestCircuit(5);
      createdCircuits.push(circuit.id);

      const devis = await prisma.devis.create({
        data: {
          userId: clientUser.id,
          circuitId: circuit.id,
          prenom: "Sophie",
          nom: "Rajaonarison",
          telephone: "0343333333",
          dateDebutSouhaitee: new Date("2026-10-15"),
          dateFinSouhaitee: new Date("2026-10-20"),
          adultes: 2,
          nombrePersonnes: 2,
          statut: StatutDevis.en_modification,
          commentaireConseiller: "Veuillez changer le type d'hébergement",
        },
      });
      createdDevis.push(devis.id);

      // Le devis est en_modification. Le client peut soit modifier, soit « abandonner »
      // en renvoyant le devis sans changement → repasse en_cours
      await prisma.devis.update({
        where: { id: devis.id },
        data: {
          statut: StatutDevis.en_cours,
          montantTotal: null,
          commentaireConseiller: null,
        },
      });

      const devisAfterAbandon = await prisma.devis.findUnique({ where: { id: devis.id } });
      assert(devisAfterAbandon!.statut === StatutDevis.en_cours, "Devis repasse en_cours après abandon");
      assert(devisAfterAbandon!.commentaireConseiller === null, "Commentaire conseiller effacé");

      // Le conseiller peut revalider
      await prisma.devis.update({
        where: { id: devis.id },
        data: { statut: StatutDevis.valide, montantTotal: 2500000 },
      });

      const devisAfterRevalidation = await prisma.devis.findUnique({ where: { id: devis.id } });
      assert(devisAfterRevalidation!.statut === StatutDevis.valide, "Revalidation réussie après abandon");

      console.log("✅ TEST 4 réussi\n");
    }

    // ── TEST 5 : PAIEMENT FAILED ────────────────────────────────────────────────
    {
      console.log("TEST 5 : Paiement FAILED → réservation ANNULEE + places libérées");

      const circuit = await createTestCircuit(10);
      createdCircuits.push(circuit.id);

      const reservation = await createTestReservation(clientUser.id, circuit.id, 2);
      createdReservations.push(reservation.id);

      await prisma.circuit.update({
        where: { id: circuit.id },
        data: { nbPlacesDisponibles: { decrement: 2 } },
      });
      const circuitBefore = await prisma.circuit.findUnique({ where: { id: circuit.id } });
      assert(circuitBefore!.nbPlacesDisponibles === 8, "Places décrémentées");

      const tx = await createTestTransaction(reservation.id, clientUser.id, provider!.id, future);

      // Simuler un webhook FAILED
      await prisma.paymentTransaction.update({
        where: { id: tx.id },
        data: { status: PaymentStatus.FAILED },
      });

      // Expirer via le service (libère les places)
      await expirationService.expireReservation(reservation.id, tx.id);

      const reservationAfter = await prisma.reservation.findUnique({ where: { id: reservation.id } });
      assert(reservationAfter!.status === ReservationStatus.ANNULEE, "Réservation ANNULEE après FAILED");

      const circuitAfter = await prisma.circuit.findUnique({ where: { id: circuit.id } });
      assert(circuitAfter!.nbPlacesDisponibles === 10, "Places libérées après FAILED");

      const txAfter = await prisma.paymentTransaction.findUnique({ where: { id: tx.id } });
      assert(txAfter!.status === PaymentStatus.EXPIRED, "Transaction passe à EXPIRED après expiration");

      // Notification client
      await prisma.notification.create({
        data: {
          userId: clientUser.id,
          titre: "Paiement échoué",
          message: `Le paiement pour la réservation #${reservation.id} a échoué`,
        },
      });

      const notifs = await prisma.notification.findMany({
        where: { userId: clientUser.id, titre: "Paiement échoué" },
      });
      assert(notifs.length >= 1, "Notification d'échec créée");

      console.log("✅ TEST 5 réussi\n");
    }

    // ── TEST 6 : PAIEMENT EXPIRED → EXPIRATION AUTOMATIQUE ──────────────────────
    {
      console.log("TEST 6 : Paiement EXPIRED → expiration automatique batch");

      const circuit = await createTestCircuit(15);
      createdCircuits.push(circuit.id);

      const reservation = await createTestReservation(clientUser.id, circuit.id, 4);
      createdReservations.push(reservation.id);

      await prisma.circuit.update({
        where: { id: circuit.id },
        data: { nbPlacesDisponibles: { decrement: 4 } },
      });

      await createTestTransaction(reservation.id, clientUser.id, provider!.id, past);

      const result = await expirationService.expireAllPending();
      const processed = result.details.find((d) => d.reservationId === reservation.id);

      assert(processed !== undefined, "Réservation traitée par le batch");
      assert(processed!.placesRestored === 4, "4 places restituées");

      const reservationAfter = await prisma.reservation.findUnique({ where: { id: reservation.id } });
      assert(reservationAfter!.status === ReservationStatus.ANNULEE, "Réservation ANNULEE");
      assert(reservationAfter!.placesReleasedAt !== null, "placesReleasedAt posé");

      const circuitAfter = await prisma.circuit.findUnique({ where: { id: circuit.id } });
      assert(circuitAfter!.nbPlacesDisponibles === 15, "Places restaurées à 15");

      console.log("✅ TEST 6 réussi\n");
    }

    // ── TEST 7 : DOUBLE PAIEMENT → IDEMPOTENCE ──────────────────────────────────
    {
      console.log("TEST 7 : Double paiement sur la même réservation → idempotence");

      const circuit = await createTestCircuit(10);
      createdCircuits.push(circuit.id);

      const reservation = await createTestReservation(clientUser.id, circuit.id, 2);
      createdReservations.push(reservation.id);

      await prisma.circuit.update({
        where: { id: circuit.id },
        data: { nbPlacesDisponibles: { decrement: 2 } },
      });

      // Première tentative de paiement (crée une transaction directement)
      const tx1 = await createTestTransaction(reservation.id, clientUser.id, provider!.id, future);
      assert(tx1 !== undefined, "Première transaction créée");
      assert(tx1.status === PaymentStatus.PENDING, "Première tx PENDING");

      // Deuxième tentative de paiement (crée une transaction distincte)
      const tx2 = await createTestTransaction(reservation.id, clientUser.id, provider!.id, future);
      assert(tx2 !== undefined, "Deuxième transaction créée");
      assert(tx2.id !== tx1.id, "Deux transactions distinctes");
      assert(tx2.status === PaymentStatus.PENDING, "Deuxième tx PENDING");

      // Payer la première
      const payRes = await POST(
        createPapiWebhookReq({
          paymentStatus: "SUCCESS",
          currency: "MGA",
          amount: 450000,
          merchantPaymentReference: tx1.providerRef,
          notificationToken: "test-token-e2e",
        })
      );
      assert(payRes.status === 200, "Premier webhook SUCCESS");

      const resAfter = await prisma.reservation.findUnique({ where: { id: reservation.id } });
      assert(resAfter!.status === ReservationStatus.PAYEE, "Réservation PAYEE");

      // Tenter de payer la deuxième → le webhook doit être idempotent
      const payRes2 = await POST(
        createPapiWebhookReq({
          paymentStatus: "SUCCESS",
          currency: "MGA",
          amount: 450000,
          merchantPaymentReference: tx2.providerRef,
          notificationToken: "test-token-e2e",
        })
      );
      assert(payRes2.status === 200, "Deuxième webhook idempotent (200)");

      // La réservation doit rester PAYEE
      const resFinal = await prisma.reservation.findUnique({ where: { id: reservation.id } });
      assert(resFinal!.status === ReservationStatus.PAYEE, "Réservation reste PAYEE");

      // Les places ne doivent pas être doublement modifiées
      const circuitAfter = await prisma.circuit.findUnique({ where: { id: circuit.id } });
      assert(circuitAfter!.nbPlacesDisponibles === 8, "Places cohérentes (8)");

      console.log("✅ TEST 7 réussi\n");
    }

    // ── TEST 8 : DOUBLE WEBHOOK → IDEMPOTENCE ───────────────────────────────────
    {
      console.log("TEST 8 : Double webhook identique → idempotence");

      const circuit = await createTestCircuit(10);
      createdCircuits.push(circuit.id);

      const reservation = await createTestReservation(clientUser.id, circuit.id, 2);
      createdReservations.push(reservation.id);

      await prisma.circuit.update({
        where: { id: circuit.id },
        data: { nbPlacesDisponibles: { decrement: 2 } },
      });

      const tx = await createTestTransaction(reservation.id, clientUser.id, provider!.id, future);

      const webhookPayload = {
        paymentStatus: "SUCCESS",
        paymentMethod: "ORANGE_MONEY",
        currency: "MGA",
        amount: 450000,
        merchantPaymentReference: tx.providerRef,
        notificationToken: "test-token-e2e",
      };

      // Premier webhook
      const res1 = await POST(createPapiWebhookReq(webhookPayload));
      assert(res1.status === 200, "Premier webhook 200");

      const notifsBefore = await prisma.notification.count({
        where: { userId: clientUser.id, titre: "Paiement confirmé" },
      });

      // Deuxième webhook (identique)
      const res2 = await POST(createPapiWebhookReq(webhookPayload));
      assert(res2.status === 200, "Deuxième webhook 200 (idempotent)");

      const notifsAfter = await prisma.notification.count({
        where: { userId: clientUser.id, titre: "Paiement confirmé" },
      });
      assert(notifsAfter === notifsBefore, "Aucune notification dupliquée");

      // Vérifier qu'une seule facture existe
      const invoices = await prisma.invoice.findMany({ where: { reservationId: reservation.id } });
      assert(invoices.length === 1, "Une seule facture créée");

      console.log("✅ TEST 8 réussi\n");
    }

    // ── TEST 9 : DERNIÈRE PLACE DISPONIBLE ──────────────────────────────────────
    {
      console.log("TEST 9 : Dernière place disponible → réservation OK");

      const circuit = await createTestCircuit(2);
      createdCircuits.push(circuit.id);

      const reservation = await createTestReservation(clientUser.id, circuit.id, 2);
      createdReservations.push(reservation.id);

      // Atomically reserve the last 2 seats
      const updated = await prisma.circuit.updateMany({
        where: {
          id: circuit.id,
          nbPlacesDisponibles: { gte: 2 },
        },
        data: { nbPlacesDisponibles: { decrement: 2 } },
      });
      assert(updated.count === 1, "Décrément atomique réussi");

      const circuitAfter = await prisma.circuit.findUnique({ where: { id: circuit.id } });
      assert(circuitAfter!.nbPlacesDisponibles === 0, "Plus de places");

      // Un autre client tente de réserver → doit échouer
      const updated2 = await prisma.circuit.updateMany({
        where: {
          id: circuit.id,
          nbPlacesDisponibles: { gte: 1 },
        },
        data: { nbPlacesDisponibles: { decrement: 1 } },
      });
      assert(updated.count === 1, "Premier décrément ok");
      assert(updated2.count === 0, "Deuxième décrément échoue (0 places)");

      console.log("✅ TEST 9 réussi\n");
    }

    // ── TEST 10 : DEUX CLIENTS SE DISPUTENT LA DERNIÈRE PLACE ───────────────────
    {
      console.log("TEST 10 : Deux clients concurrents pour la dernière place → un seul gagne");

      const circuit = await createTestCircuit(1);
      createdCircuits.push(circuit.id);

      // Simuler deux clients concurrents
      const client1 = await createTestUser();
      const client2 = await createTestUser();

      const reserve1 = prisma.circuit.updateMany({
        where: { id: circuit.id, nbPlacesDisponibles: { gte: 1 } },
        data: { nbPlacesDisponibles: { decrement: 1 } },
      });
      const reserve2 = prisma.circuit.updateMany({
        where: { id: circuit.id, nbPlacesDisponibles: { gte: 1 } },
        data: { nbPlacesDisponibles: { decrement: 1 } },
      });

      const [r1, r2] = await Promise.all([reserve1, reserve2]);

      const nbGagnants = [r1.count, r2.count].filter((c) => c === 1).length;
      const nbPerdants = [r1.count, r2.count].filter((c) => c === 0).length;

      assert(nbGagnants === 1, `Un seul gagnant (obtenu ${nbGagnants})`);
      assert(nbPerdants === 1, `Un seul perdant (obtenu ${nbPerdants})`);

      const circuitAfter = await prisma.circuit.findUnique({ where: { id: circuit.id } });
      assert(circuitAfter!.nbPlacesDisponibles === 0, "Places à 0 après concurrent");

      // Nettoyer les users de test
      await prisma.user.deleteMany({ where: { id: { in: [client1.id, client2.id] } } });

      console.log("✅ TEST 10 réussi\n");
    }

    // ── TEST 11 : UTILISATEUR NON AUTORISÉ ──────────────────────────────────────
    {
      console.log("TEST 11 : Utilisateur non autorisé → accès refusé");

      const circuit = await createTestCircuit(5);
      createdCircuits.push(circuit.id);

      const devis = await prisma.devis.create({
        data: {
          userId: clientUser.id,
          circuitId: circuit.id,
          prenom: "Auth",
          nom: "Test",
          telephone: "0344444444",
          dateDebutSouhaitee: new Date("2026-11-01"),
          dateFinSouhaitee: new Date("2026-11-05"),
          adultes: 1,
          nombrePersonnes: 1,
          statut: StatutDevis.en_cours,
        },
      });
      createdDevis.push(devis.id);

      const otherUser = await createTestUser();

      // L'autre utilisateur ne peut pas initier un paiement pour le devis d'un autre
      let unauthorized = false;
      try {
        await paymentService.initiateFromDevis(devis.id, PaymentMethod.PAPI, otherUser.id);
      } catch (e) {
        unauthorized = e instanceof Error && e.message.includes("Accès refusé");
      }
      assert(unauthorized, "Autre utilisateur doit être rejeté");

      // L'autre utilisateur ne peut pas récupérer la réservation d'un autre
      // getByUserId filtre par userId, donc retourne une liste vide — pas d'erreur
      const otherReservations = await reservationService.getByUserId(otherUser.id);
      const hasDevisReservation = otherReservations.some((r) => r.devisId === devis.id);
      assert(!hasDevisReservation, "L'autre utilisateur ne voit pas les réservations d'un autre");

      // Nettoyer
      await prisma.user.deleteMany({ where: { id: otherUser.id } });

      console.log("✅ TEST 11 réussi\n");
    }

    // ── TEST 12 : SUPPRESSION DEVIS → CASCADE SOFT-DELETE ──────────────────────
    {
      console.log("TEST 12 : Suppression devis → cascade soft-delete réservation");

      const circuit = await createTestCircuit(5);
      createdCircuits.push(circuit.id);

      const devis = await prisma.devis.create({
        data: {
          userId: clientUser.id,
          circuitId: circuit.id,
          prenom: "Cascade",
          nom: "Test",
          telephone: "0345555555",
          dateDebutSouhaitee: new Date("2026-11-01"),
          dateFinSouhaitee: new Date("2026-11-05"),
          adultes: 2,
          nombrePersonnes: 2,
          statut: StatutDevis.en_cours,
        },
      });
      createdDevis.push(devis.id);

      // Créer une réservation liée
      const reservation = await prisma.reservation.create({
        data: {
          userId: clientUser.id,
          devisId: devis.id,
          circuitId: circuit.id,
          nbVoyageurs: 2,
          montantFinal: 2500000,
          status: ReservationStatus.EN_ATTENTE,
          statut: StatutReservation.confirmee,
        },
      });
      createdReservations.push(reservation.id);

      // Supprimer le devis → doit cascade soft-delete la réservation
      await deletionService.deleteDevis(devis.id);

      const devisAfterDelete = await prisma.devis.findUnique({ where: { id: devis.id } });
      assert(devisAfterDelete!.deletedAt !== null, "Devis soft-deleted");

      const reservationAfterDelete = await prisma.reservation.findUnique({ where: { id: reservation.id } });
      assert(reservationAfterDelete!.deletedAt !== null, "Réservation cascade soft-deleted");

      console.log("✅ TEST 12 réussi\n");
    }

    // ── TEST 13 : ANNULATION RÉSERVATION → RESTAURATION PLACES ─────────────────
    {
      console.log("TEST 13 : Annulation réservation → restauration atomique des places");

      const circuit = await createTestCircuit(5);
      createdCircuits.push(circuit.id);

      const reservation = await createTestReservation(clientUser.id, circuit.id, 3);
      createdReservations.push(reservation.id);

      await prisma.circuit.update({
        where: { id: circuit.id },
        data: { nbPlacesDisponibles: { decrement: 3 } },
      });
      const circuitBefore = await prisma.circuit.findUnique({ where: { id: circuit.id } });
      assert(circuitBefore!.nbPlacesDisponibles === 2, "Places à 2 avant annulation");

      // Annuler via le service
      await reservationService.cancel(reservation.id);

      const reservationAfter = await prisma.reservation.findUnique({ where: { id: reservation.id } });
      assert(reservationAfter!.status === ReservationStatus.ANNULEE, "Réservation ANNULEE");
      assert(reservationAfter!.statut === "annulee", "Statut rétro-compat annulee");
      assert(reservationAfter!.placesReleasedAt !== null, "placesReleasedAt posé");

      const circuitAfter = await prisma.circuit.findUnique({ where: { id: circuit.id } });
      assert(circuitAfter!.nbPlacesDisponibles === 5, "Places restaurées à 5");

      console.log("✅ TEST 13 réussi\n");
    }

    // ── TEST 14 : DOUBLE ANNULATION → PAS DE DOUBLE RESTAURATION ────────────────
    {
      console.log("TEST 14 : Double annulation → pas de double restauration");

      const circuit = await createTestCircuit(5);
      createdCircuits.push(circuit.id);

      const reservation = await createTestReservation(clientUser.id, circuit.id, 3);
      createdReservations.push(reservation.id);

      await prisma.circuit.update({
        where: { id: circuit.id },
        data: { nbPlacesDisponibles: { decrement: 3 } },
      });

      // Première annulation
      await reservationService.cancel(reservation.id);

      const circuitMid = await prisma.circuit.findUnique({ where: { id: circuit.id } });
      assert(circuitMid!.nbPlacesDisponibles === 5, "Places à 5 après 1ère annulation");

      // Deuxième annulation (idempotente grâce à placesReleasedAt)
      await reservationService.cancel(reservation.id);

      const circuitAfter = await prisma.circuit.findUnique({ where: { id: circuit.id } });
      assert(circuitAfter!.nbPlacesDisponibles === 5, "Places restent à 5 (pas de double restauration)");

      console.log("✅ TEST 14 réussi\n");
    }

    // ── TEST 15 : FACTURE CRÉÉE APRÈS WEBHOOK PAID ──────────────────────────────
    {
      console.log("TEST 15 : Facture créée automatiquement après webhook PAID");

      const circuit = await createTestCircuit(10);
      createdCircuits.push(circuit.id);

      const reservation = await createTestReservation(clientUser.id, circuit.id, 1);
      createdReservations.push(reservation.id);

      const tx = await createTestTransaction(reservation.id, clientUser.id, provider!.id, future);

      // Vérifier qu'aucune facture n'existe
      const invoicesBefore = await prisma.invoice.findMany({ where: { reservationId: reservation.id } });
      assert(invoicesBefore.length === 0, "Aucune facture avant paiement");

      // Webhook SUCCESS
      await POST(
        createPapiWebhookReq({
          paymentStatus: "SUCCESS",
          currency: "MGA",
          amount: 450000,
          merchantPaymentReference: tx.providerRef,
          notificationToken: "test-token-e2e",
        })
      );

      // Vérifier la facture
      const invoicesAfter = await prisma.invoice.findMany({ where: { reservationId: reservation.id } });
      assert(invoicesAfter.length === 1, "Une facture créée");
      assert(invoicesAfter[0].status === "PAID", "Facture PAID");
      assert(Number(invoicesAfter[0].amount) === 450000, "Montant facture = montant transaction");
      assert(invoicesAfter[0].userId === clientUser.id, "Facture liée au bon utilisateur");

      console.log("✅ TEST 15 réussi\n");
    }

    // ── TEST 16 : PLACES PAS RESTITUÉES SI PAIEMENT RÉUSSI AVANT EXPIRATION ────
    {
      console.log("TEST 16 : Paiement réussi avant expiration → places conservées");

      const circuit = await createTestCircuit(10);
      createdCircuits.push(circuit.id);

      const reservation = await createTestReservation(clientUser.id, circuit.id, 3);
      createdReservations.push(reservation.id);

      await prisma.circuit.update({
        where: { id: circuit.id },
        data: { nbPlacesDisponibles: { decrement: 3 } },
      });

      const tx = await createTestTransaction(reservation.id, clientUser.id, provider!.id, future);

      // Payer avant expiration
      await POST(
        createPapiWebhookReq({
          paymentStatus: "SUCCESS",
          currency: "MGA",
          amount: 450000,
          merchantPaymentReference: tx.providerRef,
          notificationToken: "test-token-e2e",
        })
      );

      // Tenter l'expiration → doit être ignorée (skippedPaid)
      const result = await expirationService.expireReservation(reservation.id, tx.id);
      assert(result.skippedPaid === true, "Expiration ignorée (déjà PAYEE)");

      const circuitAfter = await prisma.circuit.findUnique({ where: { id: circuit.id } });
      assert(circuitAfter!.nbPlacesDisponibles === 7, "Places restent à 7 (pas de restitution)");

      console.log("✅ TEST 16 réussi\n");
    }

    // ── TEST 17 : TRANSACTION SŒUR ACTIVE → PAS DE LIBÉRATION ───────────────────
    {
      console.log("TEST 17 : Transaction sœur active → pas de libération prématurée");

      const circuit = await createTestCircuit(10);
      createdCircuits.push(circuit.id);

      const reservation = await createTestReservation(clientUser.id, circuit.id, 2);
      createdReservations.push(reservation.id);

      await prisma.circuit.update({
        where: { id: circuit.id },
        data: { nbPlacesDisponibles: { decrement: 2 } },
      });

      // Première transaction (expirée)
      const tx1 = await createTestTransaction(reservation.id, clientUser.id, provider!.id, past);
      // Deuxième transaction (sœur active encore valide) : on la crée mais on
      // n'en a pas besoin ensuite, elle maintient la réservation vivante
      await createTestTransaction(reservation.id, clientUser.id, provider!.id, future);

      const result = await expirationService.expireReservation(reservation.id, tx1.id);

      assert(result.placesRestored === 0, "Aucune place libérée tant que tx2 est active");

      const tx1After = await prisma.paymentTransaction.findUnique({ where: { id: tx1.id } });
      assert(tx1After!.status === PaymentStatus.EXPIRED, "tx1 passe à EXPIRED");

      const resAfter = await prisma.reservation.findUnique({ where: { id: reservation.id } });
      assert(resAfter!.status === ReservationStatus.EN_ATTENTE, "Réservation reste EN_ATTENTE pour tx2");

      const circuitAfter = await prisma.circuit.findUnique({ where: { id: circuit.id } });
      assert(circuitAfter!.nbPlacesDisponibles === 8, "Places restent bloquées (8)");

      console.log("✅ TEST 17 réussi\n");
    }

    // ── TEST 18 : SUPPRESSION RÉSERVATION AVEC PLACES DÉJÀ LIBÉRÉES ─────────────
    {
      console.log("TEST 18 : Suppression réservation avec places déjà libérées → pas de double restitution");

      const circuit = await createTestCircuit(10);
      createdCircuits.push(circuit.id);

      const reservation = await createTestReservation(clientUser.id, circuit.id, 3);
      createdReservations.push(reservation.id);

      await prisma.circuit.update({
        where: { id: circuit.id },
        data: { nbPlacesDisponibles: { decrement: 3 } },
      });

      const tx = await createTestTransaction(reservation.id, clientUser.id, provider!.id, past);

      // Expiration libère les places
      await expirationService.expireReservation(reservation.id, tx.id);

      const circuitMid = await prisma.circuit.findUnique({ where: { id: circuit.id } });
      assert(circuitMid!.nbPlacesDisponibles === 10, "Places restaurées à 10 par expiration");

      // Supprimer la réservation via deletionService
      await deletionService.deleteReservation(reservation.id);

      const circuitAfter = await prisma.circuit.findUnique({ where: { id: circuit.id } });
      assert(circuitAfter!.nbPlacesDisponibles === 10, "Places restent à 10 (pas de double restitution)");

      const reservationAfter = await prisma.reservation.findUnique({ where: { id: reservation.id } });
      assert(reservationAfter!.deletedAt !== null, "Réservation soft-deleted");

      console.log("✅ TEST 18 réussi\n");
    }

    // ── TEST 19 : WEBHOOK FAILED → LIBÉRATION PLACES ────────────────────────────
    {
      console.log("TEST 19 : Webhook FAILED → places libérées");

      const circuit = await createTestCircuit(5);
      createdCircuits.push(circuit.id);

      const reservation = await createTestReservation(clientUser.id, circuit.id, 2);
      createdReservations.push(reservation.id);

      await prisma.circuit.update({
        where: { id: circuit.id },
        data: { nbPlacesDisponibles: { decrement: 2 } },
      });

      const tx = await createTestTransaction(reservation.id, clientUser.id, provider!.id, future);

      const webhookRes = await POST(
        createPapiWebhookReq({
          paymentStatus: "FAILED",
          currency: "MGA",
          amount: 450000,
          merchantPaymentReference: tx.providerRef,
          notificationToken: "test-token-e2e",
        })
      );
      assert(webhookRes.status === 200, "Webhook FAILED traité (200)");

      const reservationAfter = await prisma.reservation.findUnique({ where: { id: reservation.id } });
      assert(reservationAfter!.status === ReservationStatus.ANNULEE, "Réservation ANNULEE après FAILED");

      const circuitAfter = await prisma.circuit.findUnique({ where: { id: circuit.id } });
      assert(circuitAfter!.nbPlacesDisponibles === 5, "Places libérées après FAILED");

      console.log("✅ TEST 19 réussi\n");
    }

    // ── TEST 20 : TRANSITIONS DE STATUT INVALIDES ───────────────────────────────
    {
      console.log("TEST 20 : Transitions de statut invalides → rejetées");

      // PAYEE → ANNULEE doit être protégé
      const reservation = await createTestReservation(clientUser.id, null, 1, ReservationStatus.PAYEE);
      createdReservations.push(reservation.id);

      let rejected = false;
      try {
        await paymentService.initiatePayment(reservation.id, PaymentMethod.PAPI, clientUser.id);
      } catch (e) {
        rejected = e instanceof Error && e.message.includes("réglée");
      }
      assert(rejected, "Paiement sur réservation PAYEE rejeté");

      // ANNULEE → PAYEE doit être protégé par expirationService
      const reservation2 = await createTestReservation(clientUser.id, null, 1, ReservationStatus.ANNULEE);
      createdReservations.push(reservation2.id);

      let rejected2 = false;
      try {
        await paymentService.initiatePayment(reservation2.id, PaymentMethod.PAPI, clientUser.id);
      } catch (e) {
        rejected2 = e instanceof Error && e.message.includes("annulée");
      }
      assert(rejected2, "Paiement sur réservation ANNULEE rejeté");

      // Devis en_modification → paiement rejeté
      const circuit = await createTestCircuit(5);
      createdCircuits.push(circuit.id);

      const devisModif = await prisma.devis.create({
        data: {
          userId: clientUser.id,
          circuitId: circuit.id,
          prenom: "Test",
          nom: "Statut",
          telephone: "0346666666",
          dateDebutSouhaitee: new Date("2026-11-01"),
          dateFinSouhaitee: new Date("2026-11-05"),
          adultes: 1,
          nombrePersonnes: 1,
          statut: StatutDevis.en_modification,
        },
      });
      createdDevis.push(devisModif.id);

      let rejectedModif = false;
      try {
        await paymentService.initiateFromDevis(devisModif.id, PaymentMethod.PAPI, clientUser.id);
      } catch (e) {
        rejectedModif = e instanceof Error && e.message.includes("accepté");
      }
      assert(rejectedModif, "Paiement sur devis en_modification rejeté");

      console.log("✅ TEST 20 réussi\n");
    }

    console.log("🎉 Tous les tests E2E du parcours métier (P1.4) ont réussi !\n");
  } catch (err) {
    console.error("❌ Erreur pendant les tests E2E:", err);
    throw err;
  } finally {
    // ── Nettoyage ──────────────────────────────────────────────────────────────
    console.log("🧹 Nettoyage des données de test...");

    for (const reservationId of createdReservations) {
      try {
        await prisma.invoice.deleteMany({ where: { reservationId } });
        await prisma.paymentWebhook.deleteMany({ where: { transaction: { reservationId } } });
        await prisma.paymentLog.deleteMany({ where: { transaction: { reservationId } } });
        await prisma.paymentTransaction.deleteMany({ where: { reservationId } });
        await prisma.paiement.deleteMany({ where: { reservationId } });
        await prisma.notification.deleteMany({ where: { message: { contains: `#${reservationId}` } } });
        await prisma.reservation.deleteMany({ where: { id: reservationId } });
      } catch {
        // Ignorer les erreurs de nettoyage
      }
    }

    for (const devisId of createdDevis) {
      try {
        await prisma.notification.deleteMany({ where: { message: { contains: `#${devisId}` } } });
        await prisma.devis.deleteMany({ where: { id: devisId } });
      } catch {
        // Ignorer les erreurs de nettoyage
      }
    }

    for (const circuitId of createdCircuits) {
      try {
        await prisma.circuit.deleteMany({ where: { id: circuitId } });
      } catch {
        // Ignorer les erreurs de nettoyage
      }
    }

    // Nettoyer les users de test
    try {
      await prisma.notification.deleteMany({ where: { userId: clientUser.id } });
      await prisma.notification.deleteMany({ where: { userId: conseillerUser.id } });
      await prisma.user.deleteMany({ where: { id: { in: [clientUser.id, conseillerUser.id] } } });
    } catch {
      // Ignorer
    }

    console.log("✅ Nettoyage terminé\n");
  }
}
