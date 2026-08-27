// scripts/run-papi-tests.ts
// Exécute les tests d'intégration :
//   P0.1 — Webhook Papi.mg
//   P0.3 — Expiration des réservations
//   P1.4 — Tests E2E du parcours métier complet
// Nécessite une base de données accessible (DATABASE_URL dans .env.local).
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { runPapiWebhookTests } = await import(
    "../lib/services/payment/__tests__/papi.webhook.test"
  );
  await runPapiWebhookTests();

  console.log("\n" + "─".repeat(60) + "\n");

  const { runExpirationTests } = await import(
    "../lib/services/payment/__tests__/expiration.test"
  );
  await runExpirationTests();

  console.log("\n" + "─".repeat(60) + "\n");

  const { runBusinessWorkflowTests } = await import(
    "../lib/services/payment/__tests__/business-workflow.test"
  );
  await runBusinessWorkflowTests();
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Échec de l'exécution des tests:", err);
    process.exit(1);
  });
