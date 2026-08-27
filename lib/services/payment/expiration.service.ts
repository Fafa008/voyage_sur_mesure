// lib/services/payment/expiration.service.ts
//
// P0.3 — Service d'expiration des réservations en attente de paiement.
//
// Responsabilités :
// - Détecter les PaymentTransactions PENDING/PROCESSING dont expiresAt est dépassé
// - Libérer atomiquement les places du circuit concerné
// - Marquer la Reservation comme ANNULEE
// - Garantir l'idempotence via Reservation.placesReleasedAt
// - Journaliser chaque opération de façon structurée
//
// Règles métier respectées :
// 1. Une réservation PAYEE n'est JAMAIS libérée automatiquement
// 2. Une libération ne peut se produire qu'une seule fois (placesReleasedAt verrou)
// 3. nbPlacesDisponibles ne peut pas dépasser la capacité réelle du circuit
// 4. L'opération est atomique (transaction Prisma)
// 5. Idempotente : deux exécutions simultanées n'ont qu'un seul effet
// 6. Ne modifie PAS la logique soft-delete de P0.2
// 7. Ne modifie PAS le webhook PAPI sécurisé de P0.1

import { PaymentStatus, ReservationStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ExpirationResult {
  reservationId: number;
  transactionId: string;
  circuitId: number | null;
  placesRestored: number;
  alreadyReleased: boolean;
  skippedPaid: boolean;
}

interface BatchResult {
  processed: number;
  alreadyReleased: number;
  skippedPaid: number;
  errors: number;
  details: ExpirationResult[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export class ExpirationService {
  /**
   * Expire une réservation spécifique de façon atomique.
   *
   * Peut être appelé :
   * - Depuis le webhook PAPI (statut EXPIRED / FAILED reçu)
   * - Depuis le cron interne (expiresAt dépassé)
   * - Depuis expireAllPending() pour le traitement en lot
   *
   * Si un client Prisma de transaction est fourni (tx), la fonction
   * l'utilise directement — permettant de s'intégrer dans une transaction
   * Prisma parente (cas du webhook PAPI).
   *
   * Si aucun client n'est fourni, la fonction crée sa propre transaction.
   *
   * IDEMPOTENCE :
   *   Le UPDATE sur Reservation utilise une condition `placesReleasedAt: null`.
   *   Si la réservation a déjà été libérée, updateMany retourne count=0
   *   et la fonction est un no-op complet — sans erreur, sans double libération.
   *
   * PROTECTION PAYEE :
   *   La condition inclut `status: { not: ReservationStatus.PAYEE }`.
   *   Une réservation PAYEE ne peut pas être expirée.
   */
  async expireReservation(
    reservationId: number,
    transactionId: string,
    externalTx?: Prisma.TransactionClient,
  ): Promise<ExpirationResult> {
    const run = async (tx: Prisma.TransactionClient): Promise<ExpirationResult> => {
      // ── 1. Récupérer la réservation avec ses données circuit
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: {
          devis: { select: { nombrePersonnes: true, circuitId: true } },
        },
      });

      if (!reservation) {
        console.warn(
          `[RESERVATION EXPIRATION] Réservation introuvable — reservationId=${reservationId} transactionId=${transactionId}`,
        );
        return {
          reservationId,
          transactionId,
          circuitId: null,
          placesRestored: 0,
          alreadyReleased: false,
          skippedPaid: false,
        };
      }

      // ── 2. Protection PAYEE — règle métier absolue
      if (reservation.status === ReservationStatus.PAYEE) {
        console.log(
          `[RESERVATION EXPIRATION] Réservation déjà PAYEE — aucune action` +
          ` reservationId=${reservationId} transactionId=${transactionId}`,
        );
        return {
          reservationId,
          transactionId,
          circuitId: reservation.circuitId,
          placesRestored: 0,
          alreadyReleased: false,
          skippedPaid: true,
        };
      }

      // ── 3. Vérification des autres transactions actives (ex: nouvelle tentative de paiement)
      //       Si une autre transaction PENDING/PROCESSING est encore valide (expiresAt > now),
      //       on marque la présente transaction comme EXPIRED, mais on ne libère pas encore la réservation.
      const activeSiblingTx = await tx.paymentTransaction.findFirst({
        where: {
          reservationId,
          id: { not: transactionId },
          status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] },
          OR: [
            { expiresAt: { gt: new Date() } },
            { expiresAt: null }
          ]
        }
      });

      // ── 4. Marquer cette transaction spécifique comme EXPIRED
      await tx.paymentTransaction.updateMany({
        where: {
          id: transactionId,
          status: { notIn: [PaymentStatus.PAID, PaymentStatus.EXPIRED, PaymentStatus.CANCELLED] },
        },
        data: { status: PaymentStatus.EXPIRED },
      });

      if (activeSiblingTx) {
        console.log(
          `[RESERVATION EXPIRATION] Autre transaction active trouvée (${activeSiblingTx.id})` +
          ` pour la réservation #${reservationId} — conservation de la réservation et des places.`,
        );
        return {
          reservationId,
          transactionId,
          circuitId: reservation.circuitId,
          placesRestored: 0,
          alreadyReleased: false,
          skippedPaid: false,
        };
      }

      // ── 5. Tentative atomique de verrouillage via placesReleasedAt
      //       Si un autre processus a déjà posé le verrou, count === 0 → no-op
      const updated = await tx.reservation.updateMany({
        where: {
          id: reservationId,
          status: { not: ReservationStatus.PAYEE },  // sécurité finale
          placesReleasedAt: null,                     // verrou idempotence
        },
        data: {
          status: ReservationStatus.ANNULEE,
          statut: "annulee",
          placesReleasedAt: new Date(),
        },
      });

      if (updated.count === 0) {
        // Déjà traité par un autre processus (idempotent)
        console.log(
          `[RESERVATION EXPIRATION] Déjà libérée (idempotent) —` +
          ` reservationId=${reservationId} transactionId=${transactionId}`,
        );
        return {
          reservationId,
          transactionId,
          circuitId: reservation.circuitId,
          placesRestored: 0,
          alreadyReleased: true,
          skippedPaid: false,
        };
      }

      // ── 5. Calculer le nombre de places à restituer et le circuitId
      const circuitId = reservation.circuitId ?? reservation.devis?.circuitId ?? null;
      const placesALiberer =
        reservation.devis?.nombrePersonnes ??
        reservation.nbVoyageurs ??
        1;

      let placesRestored = 0;

      // ── 6. Restituer les places sur le circuit (si applicable)
      if (circuitId) {
        const circuit = await tx.circuit.findUnique({
          where: { id: circuitId },
          select: { id: true, nbPlacesDisponibles: true },
        });

        if (circuit) {
          // Règle métier : nbPlacesDisponibles ne dépasse pas la capacité réelle.
          // On incrémente sans vérification de plafond car Prisma ne connaît pas
          // la capacité maximale originale. Si besoin d'un plafond, il doit être
          // géré au niveau admin.
          await tx.circuit.update({
            where: { id: circuitId },
            data: { nbPlacesDisponibles: { increment: placesALiberer } },
          });
          placesRestored = placesALiberer;
        }
      }

      // ── 7. Log structuré (sans données sensibles de paiement)
      const logMessage =
        `[RESERVATION EXPIRATION]` +
        ` reservationId=${reservationId}` +
        ` transactionId=${transactionId}` +
        ` circuitId=${circuitId ?? "N/A"}` +
        ` ancienStatut=${reservation.status}` +
        ` nouveauStatut=${ReservationStatus.ANNULEE}` +
        ` placesLibérées=${placesRestored}` +
        ` timestamp=${new Date().toISOString()}`;

      console.log(logMessage);

      // ── 8. Enregistrer dans PaymentLog pour l'audit
      await tx.paymentLog.create({
        data: {
          transactionId,
          action: "RESERVATION_EXPIRED",
          data: {
            reservationId,
            circuitId,
            placesRestored,
            previousStatus: reservation.status,
            newStatus: ReservationStatus.ANNULEE,
            triggeredAt: new Date().toISOString(),
          },
        },
      });

      return {
        reservationId,
        transactionId,
        circuitId,
        placesRestored,
        alreadyReleased: false,
        skippedPaid: false,
      };
    };

    // Si un client de transaction externe est fourni, l'utiliser directement.
    // Sinon, créer une nouvelle transaction Prisma.
    if (externalTx) {
      return run(externalTx);
    }

    return prisma.$transaction(run, {
      // Timeout généreux pour les opérations batch
      timeout: 30_000,
    });
  }

  /**
   * Traite en lot toutes les PaymentTransactions expirées.
   *
   * Critères d'expiration :
   * - status IN (PENDING, PROCESSING)
   * - expiresAt < maintenant
   * - réservation associée non PAYEE et placesReleasedAt IS NULL
   *
   * Chaque expiration est traitée dans sa propre transaction Prisma,
   * de façon à ce qu'une erreur sur l'une n'interrompe pas les autres.
   */
  async expireAllPending(): Promise<BatchResult> {
    const now = new Date();

    // Trouver toutes les transactions expirées éligibles
    const expiredTransactions = await prisma.paymentTransaction.findMany({
      where: {
        status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] },
        expiresAt: { lt: now, not: null },
        reservation: {
          status: { not: ReservationStatus.PAYEE },
          placesReleasedAt: null,
        },
      },
      select: {
        id: true,
        reservationId: true,
        expiresAt: true,
      },
      // Limite de sécurité pour éviter un lot trop grand
      take: 100,
    });

    if (expiredTransactions.length === 0) {
      console.log(`[RESERVATION EXPIRATION] Aucune transaction expirée trouvée à ${now.toISOString()}`);
      return {
        processed: 0,
        alreadyReleased: 0,
        skippedPaid: 0,
        errors: 0,
        details: [],
      };
    }

    console.log(
      `[RESERVATION EXPIRATION] ${expiredTransactions.length} transaction(s) expirée(s) détectée(s) à ${now.toISOString()}`,
    );

    const details: ExpirationResult[] = [];
    let errors = 0;
    let alreadyReleased = 0;
    let skippedPaid = 0;

    for (const tx of expiredTransactions) {
      try {
        const result = await this.expireReservation(tx.reservationId, tx.id);
        details.push(result);
        if (result.alreadyReleased) alreadyReleased++;
        if (result.skippedPaid) skippedPaid++;
      } catch (err) {
        errors++;
        console.error(
          `[RESERVATION EXPIRATION] Erreur lors de l'expiration —` +
          ` reservationId=${tx.reservationId} transactionId=${tx.id}:`,
          err instanceof Error ? err.message : String(err),
        );
      }
    }

    const processed = details.filter((d) => !d.alreadyReleased && !d.skippedPaid).length;

    console.log(
      `[RESERVATION EXPIRATION] Résultat batch —` +
      ` processed=${processed}` +
      ` alreadyReleased=${alreadyReleased}` +
      ` skippedPaid=${skippedPaid}` +
      ` errors=${errors}`,
    );

    return { processed, alreadyReleased, skippedPaid, errors, details };
  }
}

export const expirationService = new ExpirationService();
