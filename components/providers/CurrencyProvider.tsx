"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  CurrencyCode,
  CurrencyConfig,
  CurrencyService,
  SUPPORTED_CURRENCIES,
} from "@/lib/services/currency.service";

interface CurrencyContextType {
  currency: CurrencyCode;
  currencyConfig: CurrencyConfig;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (
    amountMga: number | string | { toString(): string } | null | undefined,
    options?: { showApprox?: boolean }
  ) => string;
  convertFromMga: (amountMga: number) => number;
  rates: Record<CurrencyCode, number>;
  lastUpdated: Date;
  supportedCurrencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const STORAGE_KEY = "user-currency";

function getInitialCurrency(defaultCurrency: CurrencyCode = "MGA"): CurrencyCode {
  if (typeof window === "undefined") return defaultCurrency;

  try {
    // 1. Essayer localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && CurrencyService.isSupportedCurrency(saved)) {
      return saved;
    }

    // 2. Essayer Cookie
    const match = document.cookie.match(new RegExp(`(?:^|; )${STORAGE_KEY}=([^;]*)`));
    if (match && CurrencyService.isSupportedCurrency(match[1])) {
      return match[1] as CurrencyCode;
    }
  } catch {
    // Fallback silencieux
  }

  return defaultCurrency;
}

export function CurrencyProvider({
  children,
  initialCurrency = "MGA",
}: {
  children: React.ReactNode;
  initialCurrency?: CurrencyCode;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency);
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(() =>
    CurrencyService.getRates()
  );
  const [lastUpdated, setLastUpdated] = useState<Date>(() =>
    CurrencyService.getLastUpdated()
  );

  // Synchronisation côté client au montage
  useEffect(() => {
    const detected = getInitialCurrency(initialCurrency);
    if (detected !== currency) {
      setCurrencyState(detected);
    }
  }, [initialCurrency]);

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    if (!CurrencyService.isSupportedCurrency(newCurrency)) return;

    setCurrencyState(newCurrency);

    try {
      if (typeof window !== "undefined") {
        // Enregistrer dans localStorage
        localStorage.setItem(STORAGE_KEY, newCurrency);
        // Enregistrer dans Cookie (1 an)
        document.cookie = `${STORAGE_KEY}=${newCurrency}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const formatPrice = useCallback(
    (
      amountMga: number | string | { toString(): string } | null | undefined,
      options?: { showApprox?: boolean }
    ) => {
      return CurrencyService.format(amountMga, currency, {
        ...options,
        convertFromMga: true,
      });
    },
    [currency]
  );

  const convertFromMga = useCallback(
    (amountMga: number) => {
      return CurrencyService.convert(amountMga, currency);
    },
    [currency]
  );

  const currencyConfig = useMemo(
    () => CurrencyService.getCurrencyConfig(currency),
    [currency]
  );

  const supportedCurrencies = useMemo(
    () => CurrencyService.getSupportedCurrencies(),
    []
  );

  const value = useMemo(
    () => ({
      currency,
      currencyConfig,
      setCurrency,
      formatPrice,
      convertFromMga,
      rates,
      lastUpdated,
      supportedCurrencies,
    }),
    [
      currency,
      currencyConfig,
      setCurrency,
      formatPrice,
      convertFromMga,
      rates,
      lastUpdated,
      supportedCurrencies,
    ]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fournir un fallback graceful si utilisé hors du Provider
    return {
      currency: "MGA",
      currencyConfig: SUPPORTED_CURRENCIES.MGA,
      setCurrency: () => {},
      formatPrice: (amount, opts) => CurrencyService.format(amount, "MGA", opts),
      convertFromMga: (amount) => amount,
      rates: CurrencyService.getRates(),
      lastUpdated: CurrencyService.getLastUpdated(),
      supportedCurrencies: CurrencyService.getSupportedCurrencies(),
    };
  }
  return context;
}
