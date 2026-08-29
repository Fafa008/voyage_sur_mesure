import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Le contenu est en français : les apostrophes et guillemets sont
      // légitimes dans le texte JSX. On ne signale que les caractères qui
      // modifient réellement la syntaxe JSX (> et }).
      "react/no-unescaped-entities": ["error", { forbid: [">", "}"] }],
      // Paramètres/variables préfixés "_" = volontairement non utilisés
      // (ex. implémentation d'interface, signature imposée par le framework).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  // Scripts Node en CommonJS (localtunnel, checks) : require() y est voulu.
  {
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
