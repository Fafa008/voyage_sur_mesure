/**
 * Service de gestion des devises et taux de change pour l'application Voyage Sur Mesure.
 *
 * Devise de référence métier et de stockage : MGA (Ariary malgache).
 * Devises d'affichage supportées : MGA, EUR, USD, JPY.
 */

export type CurrencyCode = "MGA" | "EUR" | "USD" | "JPY";

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  decimals: number;
  symbolPosition: "before" | "after";
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  MGA: {
    code: "MGA",
    name: "Ariary malgache",
    symbol: "MGA",
    flag: "🇲🇬",
    decimals: 0,
    symbolPosition: "after",
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    flag: "🇪🇺",
    decimals: 2,
    symbolPosition: "after",
  },
  USD: {
    code: "USD",
    name: "Dollar américain",
    symbol: "$",
    flag: "🇺🇸",
    decimals: 2,
    symbolPosition: "before",
  },
  JPY: {
    code: "JPY",
    name: "Yen japonais",
    symbol: "¥",
    flag: "🇯🇵",
    decimals: 0,
    symbolPosition: "before",
  },
};

/**
 * Taux de change de référence par défaut basés sur 1 MGA (base de calcul).
 * Taux moyens du marché :
 * 1 EUR ≈ 4 900 MGA -> 1 MGA ≈ 0.0002040816 EUR
 * 1 USD ≈ 4 500 MGA -> 1 MGA ≈ 0.0002222222 USD
 * 1 JPY ≈ 30 MGA    -> 1 MGA ≈ 0.0333333333 JPY
 */
const DEFAULT_RATES_FROM_MGA: Record<CurrencyCode, number> = {
  MGA: 1.0,
  EUR: 1 / 4900,
  USD: 1 / 4500,
  JPY: 1 / 30,
};

export class CurrencyService {
  private static rates: Record<CurrencyCode, number> = { ...DEFAULT_RATES_FROM_MGA };
  private static lastUpdated: Date = new Date();

  /**
   * Retourne la liste des devises supportées.
   */
  static getSupportedCurrencies(): CurrencyConfig[] {
    return Object.values(SUPPORTED_CURRENCIES);
  }

  /**
   * Vérifie si un code de devise est supporté.
   */
  static isSupportedCurrency(code: string): code is CurrencyCode {
    return code in SUPPORTED_CURRENCIES;
  }

  /**
   * Retourne la configuration d'une devise.
   */
  static getCurrencyConfig(code: CurrencyCode): CurrencyConfig {
    return SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES.MGA;
  }

  /**
   * Obtient le taux de change entre deux devises.
   */
  static getRate(from: CurrencyCode, to: CurrencyCode): number {
    if (from === to) return 1.0;
    const fromRateToMga = from === "MGA" ? 1.0 : 1 / this.rates[from];
    const mgaRateToTarget = this.rates[to];
    return fromRateToMga * mgaRateToTarget;
  }

  /**
   * Convertit un montant depuis MGA vers la devise cible.
   */
  static convert(amountMga: number, toCurrency: CurrencyCode): number {
    if (!amountMga || isNaN(amountMga)) return 0;
    if (toCurrency === "MGA") return Math.round(amountMga);

    const rate = this.rates[toCurrency] ?? DEFAULT_RATES_FROM_MGA[toCurrency];
    const converted = amountMga * rate;

    // Précision selon la devise
    const config = this.getCurrencyConfig(toCurrency);
    if (config.decimals === 0) {
      return Math.round(converted);
    }
    return Math.round(converted * 100) / 100;
  }

  /**
   * Formate un montant MGA dans la devise spécifiée avec le bon format monétaire.
   *
   * @param amount - Montant numérique (en MGA si convertFromMga est vrai)
   * @param currency - Devise d'affichage (défaut: "MGA")
   * @param options - Options d'affichage (showApprox, convertFromMga)
   */
  static format(
    amount: number | string | { toString(): string } | null | undefined,
    currency: CurrencyCode = "MGA",
    options?: {
      showApprox?: boolean;
      convertFromMga?: boolean;
    }
  ): string {
    const { showApprox = currency !== "MGA", convertFromMga = true } = options || {};

    if (amount === null || amount === undefined) {
      const config = this.getCurrencyConfig(currency);
      return config.symbolPosition === "before"
        ? `${config.symbol} 0`
        : `0 ${config.symbol}`;
    }

    const numMga = typeof amount === "number" ? amount : parseFloat(amount.toString());
    if (isNaN(numMga)) {
      const config = this.getCurrencyConfig(currency);
      return config.symbolPosition === "before"
        ? `${config.symbol} 0`
        : `0 ${config.symbol}`;
    }

    const config = this.getCurrencyConfig(currency);
    const finalAmount = convertFromMga && currency !== "MGA"
      ? this.convert(numMga, currency)
      : numMga;

    const formattedNumber = finalAmount.toLocaleString("fr-FR", {
      minimumFractionDigits: config.decimals > 0 && finalAmount % 1 !== 0 ? config.decimals : 0,
      maximumFractionDigits: config.decimals,
    });

    const prefix = showApprox && currency !== "MGA" ? "≈ " : "";

    if (config.symbolPosition === "before") {
      return `${prefix}${config.symbol} ${formattedNumber}`;
    }
    return `${prefix}${formattedNumber} ${config.symbol}`;
  }

  /**
   * Retourne la table des taux actuels.
   */
  static getRates(): Record<CurrencyCode, number> {
    return { ...this.rates };
  }

  /**
   * Retourne la date de dernière mise à jour des taux.
   */
  static getLastUpdated(): Date {
    return this.lastUpdated;
  }

  /**
   * Permet de mettre à jour les taux de change (par exemple depuis une API externe).
   */
  static updateRates(newRates: Partial<Record<CurrencyCode, number>>, date: Date = new Date()): void {
    this.rates = {
      ...this.rates,
      ...newRates,
      MGA: 1.0, // Toujours 1.0 pour la base de référence
    };
    this.lastUpdated = date;
  }
}
