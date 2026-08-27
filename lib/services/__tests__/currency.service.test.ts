import { describe, it } from "node:test";
import assert from "node:assert";
import { CurrencyService, SUPPORTED_CURRENCIES } from "../currency.service";
import { formatCurrency } from "@/lib/format";

describe("P1.6.4 — CurrencyService & Multi-Currency Tests", () => {
  const referenceAmountMga = 425000;

  it("TEST 1 : MGA sélectionné — Prix affiché correctement", () => {
    const formatted = CurrencyService.format(referenceAmountMga, "MGA");
    assert.strictEqual(formatted, "425 000 MGA");

    const converted = CurrencyService.convert(referenceAmountMga, "MGA");
    assert.strictEqual(converted, 425000);
  });

  it("TEST 2 : EUR sélectionné — Prix converti correctement", () => {
    const converted = CurrencyService.convert(referenceAmountMga, "EUR");
    // 425000 / 4900 = 86.73469... -> 86.73
    assert.strictEqual(converted, 86.73);

    const formatted = CurrencyService.format(referenceAmountMga, "EUR");
    assert.ok(formatted.includes("€"), "Le formatage doit inclure le symbole €");
    assert.ok(formatted.startsWith("≈ "), "Les devises étrangères doivent avoir le préfixe ≈");
  });

  it("TEST 3 : USD sélectionné — Prix converti correctement", () => {
    const converted = CurrencyService.convert(referenceAmountMga, "USD");
    // 425000 / 4500 = 94.4444... -> 94.44
    assert.strictEqual(converted, 94.44);

    const formatted = CurrencyService.format(referenceAmountMga, "USD");
    assert.ok(formatted.includes("$"), "Le formatage doit inclure le symbole $");
    assert.ok(formatted.startsWith("≈ "), "Les devises étrangères doivent avoir le préfixe ≈");
  });

  it("TEST 4 : JPY sélectionné — Prix converti correctement", () => {
    const converted = CurrencyService.convert(referenceAmountMga, "JPY");
    // 425000 / 30 = 14166.66... -> 14167
    assert.strictEqual(converted, 14167);

    const formatted = CurrencyService.format(referenceAmountMga, "JPY");
    assert.ok(formatted.includes("¥"), "Le formatage doit inclure le symbole ¥");
    assert.ok(formatted.startsWith("≈ "), "Les devises étrangères doivent avoir le préfixe ≈");
  });

  it("TEST 5 : Retour vers MGA — Prix original conservé à l'identique", () => {
    const mgaConverted = CurrencyService.convert(referenceAmountMga, "MGA");
    assert.strictEqual(mgaConverted, referenceAmountMga);
    assert.strictEqual(CurrencyService.format(mgaConverted, "MGA"), "425 000 MGA");
  });

  it("TEST 6 : Gestion des valeurs null, undefined, 0 et chaînes", () => {
    assert.strictEqual(CurrencyService.format(null, "MGA"), "0 MGA");
    assert.strictEqual(CurrencyService.format(undefined, "MGA"), "0 MGA");
    assert.strictEqual(CurrencyService.format("0", "MGA"), "0 MGA");
    assert.strictEqual(CurrencyService.format("450000", "MGA"), "450 000 MGA");
    assert.strictEqual(CurrencyService.format(null, "EUR"), "0 €");
    assert.strictEqual(CurrencyService.format(null, "USD"), "$ 0");
    assert.strictEqual(CurrencyService.format(null, "JPY"), "¥ 0");
  });

  it("TEST 7 : Calculs de taux croisés getRate()", () => {
    assert.strictEqual(CurrencyService.getRate("MGA", "MGA"), 1.0);
    assert.strictEqual(CurrencyService.getRate("EUR", "EUR"), 1.0);

    const mgaToEur = CurrencyService.getRate("MGA", "EUR");
    assert.ok(mgaToEur > 0 && mgaToEur < 1);
  });

  it("TEST 8 : Taux dynamiques et mise à jour des taux", () => {
    const originalRates = CurrencyService.getRates();
    
    // Mettre à jour avec un taux de test
    CurrencyService.updateRates({ EUR: 1 / 5000 });
    const convertedAtNewRate = CurrencyService.convert(500000, "EUR");
    assert.strictEqual(convertedAtNewRate, 100);

    // Restaurer les taux originaux
    CurrencyService.updateRates(originalRates);
  });

  it("TEST 9 : Compatibilité descendante de formatCurrency()", () => {
    // Appel sans argument de devise -> Défaut MGA
    assert.strictEqual(formatCurrency(450000), "450 000 MGA");
    assert.strictEqual(formatCurrency("1500000"), "1 500 000 MGA");
    assert.strictEqual(formatCurrency(null), "0 MGA");

    // Appel avec devise spécifiée
    assert.ok(formatCurrency(450000, "EUR").includes("€"));
    assert.ok(formatCurrency(450000, "USD").includes("$"));
    assert.ok(formatCurrency(450000, "JPY").includes("¥"));
  });

  it("TEST 10 : Liste des devises supportées conforme aux spécifications", () => {
    const currencies = CurrencyService.getSupportedCurrencies();
    const codes = currencies.map((c) => c.code);

    assert.deepStrictEqual(codes.sort(), ["EUR", "JPY", "MGA", "USD"].sort());
    assert.strictEqual(CurrencyService.isSupportedCurrency("MGA"), true);
    assert.strictEqual(CurrencyService.isSupportedCurrency("EUR"), true);
    assert.strictEqual(CurrencyService.isSupportedCurrency("USD"), true);
    assert.strictEqual(CurrencyService.isSupportedCurrency("JPY"), true);
    assert.strictEqual(CurrencyService.isSupportedCurrency("GBP"), false);
  });
});
