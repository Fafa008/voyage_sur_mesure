import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const p = new PrismaClient({ adapter });

  try {
    const devis = await p.devis.findUnique({
      where: { id: 13 },
      include: {
        circuit: true,
        user: { select: { id: true, name: true, email: true } },
        reservation: {
          include: {
            paiement: { include: { mode: true } },
          },
        },
      },
    });
    console.log("DEVIS QUERY OK:", JSON.stringify(devis, null, 2));
  } catch (e) {
    console.error("DEVIS QUERY FAILED:", e instanceof Error ? e.message : e);
  }

  const circuit = await p.circuit.findUnique({ where: { id: 6 }, select: { id: true, titre: true } });
  console.log(circuit ? "Circuit 6 OK" : "Circuit 6 NOT FOUND");

  await p.$disconnect();
}

main();
