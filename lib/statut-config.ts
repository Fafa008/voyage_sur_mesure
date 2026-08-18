import { StatutDevis, StatutReservation } from "@prisma/client";

export const statutDevisLabels: Record<StatutDevis, string> = {
  [StatutDevis.en_cours]: "En cours",
  [StatutDevis.en_modification]: "En modification",
  [StatutDevis.valide]: "Validé",
  [StatutDevis.accepte]: "Accepté",
  [StatutDevis.reserve]: "Réservé",
  [StatutDevis.refuse]: "Refusé",
};

export const statutDevisColors: Record<StatutDevis, string> = {
  [StatutDevis.en_cours]: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  [StatutDevis.en_modification]: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  [StatutDevis.valide]: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  [StatutDevis.accepte]: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  [StatutDevis.reserve]: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  [StatutDevis.refuse]: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export const statutReservationLabels: Record<StatutReservation, string> = {
  [StatutReservation.confirmee]: "Confirmée",
  [StatutReservation.annulee]: "Annulée",
  [StatutReservation.terminee]: "Terminée",
};

export const statutReservationColors: Record<StatutReservation, string> = {
  [StatutReservation.confirmee]: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  [StatutReservation.annulee]: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  [StatutReservation.terminee]: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};
