/**
 * Utilitaires de formatage pour l'affichage UI.
 *
 * Centralise le formatage monétaire pour garantir la cohérence
 * dans toute l'application (MGA = Ariary malgache).
 */

/**
 * Formate un montant en devise MGA pour affichage.
 *
 * @param amount - Montant numérique, string, Decimal Prisma, null ou undefined
 * @returns Chaîne formatée ex: "450 000 MGA"
 *
 * @example
 * formatCurrency(450000)       // "450 000 MGA"
 * formatCurrency("1500000")    // "1 500 000 MGA"
 * formatCurrency(null)         // "0 MGA"
 * formatCurrency(undefined)    // "0 MGA"
 */
export function formatCurrency(
  amount: number | string | { toString(): string } | null | undefined
): string {
  if (amount === null || amount === undefined) return "0 MGA";
  const num =
    typeof amount === "number"
      ? amount
      : parseFloat(amount.toString());
  if (isNaN(num)) return "0 MGA";
  return `${num.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} MGA`;
}
