import { CurrencyService, CurrencyCode } from "@/lib/services/currency.service";

/**
 * Utilitaires de formatage pour l'affichage UI.
 *
 * Centralise le formatage monétaire pour garantir la cohérence
 * dans toute l'application (MGA = Ariary malgache par défaut, ou devises EUR/USD/JPY).
 */

/**
 * Formate un montant en devise pour affichage.
 *
 * @param amount - Montant numérique, string, Decimal Prisma, null ou undefined (en MGA si convertFromMga est actif)
 * @param currency - Devise d'affichage (optionnel, défaut: "MGA")
 * @param options - Options de formatage (showApprox, convertFromMga)
 * @returns Chaîne formatée ex: "450 000 MGA" ou "≈ 92 €"
 *
 * @example
 * formatCurrency(450000)            // "450 000 MGA"
 * formatCurrency(450000, "EUR")     // "≈ 92 €"
 * formatCurrency("1500000")         // "1 500 000 MGA"
 * formatCurrency(null)              // "0 MGA"
 */
export function formatCurrency(
  amount: number | string | { toString(): string } | null | undefined,
  currency: CurrencyCode = "MGA",
  options?: { showApprox?: boolean; convertFromMga?: boolean }
): string {
  return CurrencyService.format(amount, currency, options);
}
