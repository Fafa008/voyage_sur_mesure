const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.devis
  .findUnique({
    where: { id: 13 },
    select: { id: true, userId: true, statut: true, montantTotal: true, circuitId: true },
  })
  .then((r) => console.log(r || "NOT FOUND"))
  .catch((e) => console.error(e.message))
  .finally(() => p.$disconnect());
