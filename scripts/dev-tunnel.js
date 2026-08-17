/**
 * dev-tunnel.js
 *
 * Starts localtunnel to expose localhost:3000 to the internet,
 * then launches `next dev` with APP_URL set to the tunnel URL.
 *
 * Usage: pnpm dev:tunnel
 *
 * The tunnel URL is printed in the console so you can configure
 * it in your PAPI dashboard if needed.
 */
const { spawn } = require("child_process");
const localtunnel = require("localtunnel");

const PORT = 3000;

async function main() {
  console.log(`\nCreating tunnel to localhost:${PORT}...`);

  const tunnel = await localtunnel({ port: PORT });

  console.log(`\nTunnel public URL: ${tunnel.url}`);
  console.log(`  Webhook URL: ${tunnel.url}/api/payment/webhook/papi`);
  console.log(`  Success URL: ${tunnel.url}/paiement/[id]/confirmation`);
  console.log(`\n  Copy these URLs to your PAPI dashboard settings.\n`);

  tunnel.on("close", () => {
    console.log("\nTunnel closed.");
    process.exit(0);
  });

  tunnel.on("error", (err) => {
    console.error("\nTunnel error:", err.message);
    process.exit(1);
  });

  const env = {
    ...process.env,
    APP_URL: tunnel.url,
    NEXT_PUBLIC_APP_URL: tunnel.url,
  };

  const nextDev = spawn("npx", ["next", "dev", "--port", String(PORT)], {
    env,
    stdio: "inherit",
    shell: true,
  });

  nextDev.on("close", (code) => {
    console.log(`\nNext dev exited with code ${code}`);
    tunnel.close();
    process.exit(code ?? 1);
  });

  process.on("SIGINT", () => {
    nextDev.kill();
    tunnel.close();
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
