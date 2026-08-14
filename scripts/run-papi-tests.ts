// scripts/run-papi-tests.ts
// Exécute les tests d'intégration du webhook Papi.mg.
// Nécessite une base de données accessible (DATABASE_URL dans .env.local).
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { runPapiWebhookTests } = await import(
    "../lib/services/payment/__tests__/papi.webhook.test"
  );
  await runPapiWebhookTests();
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Échec de l'exécution des tests Papi:", err);
    process.exit(1);
  });
