import { ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CreateReservationDTO } from "@/types/payment.types";

export class ReservationService {
  async create(data: CreateReservationDTO) {
    const reservation = await prisma.reservation.create({
      data: {
        circuitId: data.circuitId,
        devisId: data.devisId,
        userId: data.userId,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        nbVoyageurs: data.nbVoyageurs,
        montantFinal: data.montantFinal,
        status: ReservationStatus.BROUILLON,
        // Retro-compat
        statut: "confirmee",
      }
    });
    
    return reservation;
  }

  async getById(id: number) {
    return prisma.reservation.findUnique({
      where: { id },
      include: {
        circuit: true,
        user: true,
        paiements: true,
      }
    });
  }

  async getByUserId(userId: string) {
    return prisma.reservation.findMany({
      where: { deletedAt: null, userId },
      include: { circuit: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: number, status: ReservationStatus) {
    return prisma.reservation.update({
      where: { id },
      data: { status }
    });
  }

  async cancel(id: number) {
    return prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
        include: {
          devis: { select: { nombrePersonnes: true, circuitId: true } },
        },
      });

      if (!reservation) throw new Error("Réservation introuvable");

      // Verrou idempotent : si les places ont déjà été libérées
      // (ExpirationService), on ne restaure PAS.
      const alreadyReleased = reservation.placesReleasedAt !== null;

      await tx.reservation.update({
        where: { id },
        data: {
          status: ReservationStatus.ANNULEE,
          statut: "annulee",
          // Poser le verrou seulement si pas déjà posé
          ...(alreadyReleased ? {} : { placesReleasedAt: new Date() }),
        },
      });

      // Restaurer les places seulement si elles n'ont pas déjà été libérées
      if (!alreadyReleased) {
        const circuitId = reservation.circuitId ?? reservation.devis?.circuitId ?? null;
        const personnes = reservation.devis?.nombrePersonnes ?? reservation.nbVoyageurs ?? 1;

        if (circuitId) {
          await tx.circuit.update({
            where: { id: circuitId },
            data: { nbPlacesDisponibles: { increment: personnes } },
          });
        }
      }

      return reservation;
    });
  }
}

export const reservationService = new ReservationService();
