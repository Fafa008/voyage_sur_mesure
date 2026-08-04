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
      where: { userId },
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
    return prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.ANNULEE }
    });
  }
}

export const reservationService = new ReservationService();
