import { StatutDevis, StatutReservation } from "@prisma/client";

export const statutDevisLabels: Record<StatutDevis, string> = {
  [StatutDevis.en_cours]: "En cours d'analyse",
  [StatutDevis.en_modification]: "Modification demandée",
  [StatutDevis.valide]: "Validé par l'agence",
  [StatutDevis.accepte]: "Accepté",
  [StatutDevis.reserve]: "Réservé",
  [StatutDevis.refuse]: "Refusé",
};

export const statutDevisColors: Record<StatutDevis, string> = {
  [StatutDevis.en_cours]:
    "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  [StatutDevis.en_modification]:
    "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400",
  [StatutDevis.valide]:
    "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
  [StatutDevis.accepte]:
    "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
  [StatutDevis.reserve]:
    "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400",
  [StatutDevis.refuse]:
    "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400",
};

export const statutReservationLabels: Record<StatutReservation, string> = {
  [StatutReservation.confirmee]: "Confirmée",
  [StatutReservation.annulee]: "Annulée",
  [StatutReservation.terminee]: "Terminée",
};

export const statutReservationColors: Record<StatutReservation, string> = {
  [StatutReservation.confirmee]:
    "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
  [StatutReservation.annulee]:
    "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400",
  [StatutReservation.terminee]:
    "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
};
