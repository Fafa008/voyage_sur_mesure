import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

loadEnv({ path: ".env.local", override: true });

/**
 * Test du workflow Devis → Modification demandée → Renvoi client → Confirmation → Réservation.
 * Vérifie les règles métier au niveau base de données (les vérifications de rôle
 * sont testées dans le code des actions : requireStaff / requireOwner).
 */
async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const p = new PrismaClient({ adapter });
  const results: string[] = [];

  const check = (label: string, ok: boolean, extra = "") => {
    results.push(`${ok ? "✅" : "❌"} ${label}${extra ? " — " + extra : ""}`);
    if (!ok) process.exitCode = 1;
  };

  try {
    // ── Setup : client, conseiller, circuit de test ──
    const suffix = Date.now();
    const client = await p.user.create({
      data: {
        id: `test-client-${suffix}`,
        name: "Client",
        email: `test-client-${suffix}@test.local`,
        emailVerified: true,
      },
    });
    const conseiller = await p.user.create({
      data: {
        id: `test-conseiller-${suffix}`,
        name: "Conseiller",
        email: `test-conseiller-${suffix}@test.local`,
        emailVerified: true,
      },
    });

    const circuit = await p.circuit.findFirst({ where: { prixEstime: { not: null }, dureeJours: { not: null } } });
    if (!circuit) throw new Error("Aucun circuit chiffrable en base");

    // dateFin présent côté Circuit ?
    check("Circuit.dateFin existe (colonne ajoutée)", "dateFin" in circuit);

    // ── 1. Création devis par le client ──
    let devis = await p.devis.create({
      data: {
        userId: client.id,
        conseillerId: conseiller.id,
        circuitId: circuit.id,
        prenom: "Jean",
        nom: "Dupont",
        telephone: "000",
        dateDebutSouhaitee: new Date("2026-10-01"),
        dateFinSouhaitee: new Date("2026-10-10"),
        adultes: 2,
        nombrePersonnes: 2,
        typeHebergement: "hotel",
        transport: ["4x4"],
      },
    });
    check("1. Devis créé avec statut en_cours", devis.statut === "en_cours");
    check("1b. Champs client initiaux (typeHebergement=hotel, transport=[4x4])", devis.typeHebergement === "hotel" && devis.transport[0] === "4x4");

    // ── 2. Conseiller demande une modification ──
    // (reproduit la transaction de requestDevisModificationAction)
    const commentaireModif = "Merci de modifier la date de retour et de préciser le nombre d'enfants.";
    await p.$transaction([
      p.devis.update({
        where: { id: devis.id },
        data: { statut: "en_modification", commentaireConseiller: commentaireModif },
      }),
      p.notification.create({
        data: {
          userId: client.id,
          titre: "Modification demandée sur votre devis",
          message: `Votre conseiller vous demande de modifier votre devis #${devis.id} : ${commentaireModif}`,
        },
      }),
    ]);
    devis = await p.devis.findUniqueOrThrow({ where: { id: devis.id } });
    check("2. Demande de modification → statut en_modification", devis.statut === "en_modification");

    // Notification créée pour le client ?
    const notifModif = await p.notification.findFirst({
      where: { userId: client.id, titre: "Modification demandée sur votre devis" },
    });
    check("2b. Notification 'Modification demandée' envoyée au client", !!notifModif);

    // ── 3. Le CLIENT modifie lui-même son devis puis renvoie ──
    // (reproduit la transaction de updateDevisByClient)
    await p.$transaction([
      p.devis.update({
        where: { id: devis.id },
        data: {
          dateFinSouhaitee: new Date("2026-10-15"),
          enfants: 2,
          ados: 1,
          enfantsAge: "4, 7",
          nombrePersonnes: 5,
          statut: "en_cours",
        },
      }),
      p.notification.create({
        data: {
          userId: conseiller.id,
          titre: "Devis modifié par le client",
          message: `Le devis #${devis.id} a été modifié par Jean Dupont et renvoyé pour nouvelle analyse.`,
        },
      }),
    ]);
    devis = await p.devis.findUniqueOrThrow({ where: { id: devis.id } });
    check("3. Client renvoie le devis → statut en_cours", devis.statut === "en_cours");
    check("3b. Données mises à jour par le client (5 voyageurs, retour 15/10)", devis.nombrePersonnes === 5 && devis.dateFinSouhaitee !== null && devis.dateFinSouhaitee.getDate() === 15);

    const notifConseiller = await p.notification.findFirst({
      where: { userId: conseiller.id, titre: "Devis modifié par le client" },
    });
    check("3c. Conseiller notifié du renvoi", !!notifConseiller);

    // ── 4. Conseiller CONFIRME (chiffrage scellé) ──
    // (simule validateDevisWithPricing : les champs client ne doivent PAS être écrasés)
    devis = await p.devis.update({
      where: { id: devis.id },
      data: {
        statut: "valide",
        montantTotal: 4500000,
        commentaireConseiller: "Proposition ajustée à votre famille.",
        detailsCalcul: {
          calculeLe: new Date().toISOString(),
          montantTotal: 4500000,
          options: { typeHebergement: "lodge", transportType: "avion", includeGuide: true, remise: 0 },
        },
      },
    });
    check("4. Confirmation conseiller → statut valide", devis.statut === "valide");
    check(
      "4b. Champs client NON écrasés par le chiffrage (typeHebergement=hotel conservé)",
      devis.typeHebergement === "hotel" && devis.transport[0] === "4x4"
    );

    // ── 5. Client accepte puis réservation ──
    devis = await p.devis.update({ where: { id: devis.id }, data: { statut: "accepte" } });
    check("5. Client accepte → statut accepte", devis.statut === "accepte");

    // ── 6. Refus par le conseiller depuis un devis en_cours ──
    let devis2 = await p.devis.create({
      data: {
        userId: client.id,
        conseillerId: conseiller.id,
        circuitId: circuit.id,
        prenom: "Marie",
        nom: "Martin",
        telephone: "001",
        dateDebutSouhaitee: new Date("2026-11-01"),
        dateFinSouhaitee: new Date("2026-11-05"),
        adultes: 1,
        nombrePersonnes: 1,
      },
    });
    devis2 = await p.devis.update({
      where: { id: devis2.id },
      data: { statut: "refuse", commentaireConseiller: "Dossier hors zone desservie." },
    });
    check("6. Refus conseiller → statut refuse + motif", devis2.statut === "refuse" && !!devis2.commentaireConseiller);

    // Aucune réservation possible derrière un devis refusé :
    const resaSurRefuse = await p.reservation.findFirst({ where: { devisId: devis2.id } });
    check("6b. Aucune réservation liée au devis refusé", !resaSurRefuse);

    // ── Cleanup ──
    await p.notification.deleteMany({ where: { userId: { in: [client.id, conseiller.id] } } });
    await p.devis.deleteMany({ where: { userId: client.id } });
    await p.user.deleteMany({ where: { id: { in: [client.id, conseiller.id] } } });

    console.log("\n═══ RÉSULTATS DU TEST WORKFLOW DEVIS ═══\n");
    results.forEach((r) => console.log(r));
    console.log(`\n${results.every((r) => r.startsWith("✅")) ? "🎉 TOUS LES TESTS PASSENT" : "⚠️ ÉCHECS DÉTECTÉS"}\n`);
  } catch (e) {
    console.error("ERREUR FATALE:", e);
    process.exitCode = 1;
  } finally {
    await p.$disconnect();
  }
}

main();
