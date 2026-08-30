import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
  adapter,
  log: ["query", "warn", "error"],
});

async function migrateBlobUrls() {
  console.log('Migration des URLs Blob vers proxy...');
  
  const circuits = await prisma.circuit.findMany({
    include: {
      images: true,
    },
  });

  let migratedCount = 0;

  for (const circuit of circuits) {
    for (const image of circuit.images) {
      if (image.url.includes('blob.vercel-storage.com')) {
        // Extraire le filename de l'URL Blob
        const filename = image.url.split('/').pop();
        if (filename) {
          const proxyUrl = `/api/images/${filename}`;
          console.log(`Migration: ${image.url} -> ${proxyUrl}`);
          
          await prisma.imageCircuit.update({
            where: { id: image.id },
            data: { url: proxyUrl },
          });
          migratedCount++;
        }
      }
    }
  }

  console.log(`Migration terminée! ${migratedCount} images migrées.`);
}

migrateBlobUrls()
  .catch(console.error)
  .finally(() => prisma.$disconnect());