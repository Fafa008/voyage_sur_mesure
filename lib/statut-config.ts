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
    "bg-amber-500/10 text-amber-800 border-amber-500/30 dark:text-amber-300 dark:border-amber-500/40 font-semibold",
  [StatutDevis.en_modification]:
    "bg-orange-500/10 text-orange-800 border-orange-500/30 dark:text-orange-300 dark:border-orange-500/40 font-semibold",
  [StatutDevis.valide]:
    "bg-blue-500/10 text-blue-800 border-blue-500/30 dark:text-blue-300 dark:border-blue-500/40 font-semibold",
  [StatutDevis.accepte]:
    "bg-emerald-500/10 text-emerald-800 border-emerald-500/30 dark:text-emerald-300 dark:border-emerald-500/40 font-semibold",
  [StatutDevis.reserve]:
    "bg-purple-500/10 text-purple-800 border-purple-500/30 dark:text-purple-300 dark:border-purple-500/40 font-semibold",
  [StatutDevis.refuse]:
    "bg-rose-500/10 text-rose-800 border-rose-500/30 dark:text-rose-300 dark:border-rose-500/40 font-semibold",
};

export const statutReservationLabels: Record<StatutReservation, string> = {
  [StatutReservation.confirmee]: "Confirmée",
  [StatutReservation.annulee]: "Annulée",
  [StatutReservation.terminee]: "Terminée",
};

export const statutReservationColors: Record<StatutReservation, string> = {
  [StatutReservation.confirmee]:
    "bg-emerald-500/10 text-emerald-800 border-emerald-500/30 dark:text-emerald-300 dark:border-emerald-500/40 font-semibold",
  [StatutReservation.annulee]:
    "bg-rose-500/10 text-rose-800 border-rose-500/30 dark:text-rose-300 dark:border-rose-500/40 font-semibold",
  [StatutReservation.terminee]:
    "bg-slate-500/10 text-slate-800 border-slate-500/30 dark:text-slate-300 dark:border-slate-500/40 font-semibold",
};
