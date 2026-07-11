// prisma/seed.ts

import { PrismaClient, RoleNom } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Début du seed...");

  // ==========================
  // ROLES
  // ==========================
  await prisma.role.createMany({
    data: [
      { nom: RoleNom.admin },
      { nom: RoleNom.conseiller },
      { nom: RoleNom.client },
    ],
    skipDuplicates: true,
  });

  const adminRole = await prisma.role.findUnique({
    where: { nom: RoleNom.admin },
  });

  const clientRole = await prisma.role.findUnique({
    where: { nom: RoleNom.client },
  });

  if (!adminRole || !clientRole) {
    throw new Error("Impossible de récupérer les rôles.");
  }

  console.log("✅ Rôles créés");

  // ==========================
  // UTILISATEURS
  // ==========================
  await prisma.utilisateur.upsert({
    where: {
      email: "admin@voyage.com",
    },
    update: {},
    create: {
      nom: "Administrateur",
      prenom: "System",
      email: "admin@voyage.com",
      motDePasseHash: "admin123",
      roleId: adminRole.id,
    },
  });

  await prisma.utilisateur.upsert({
    where: {
      email: "client@voyage.com",
    },
    update: {},
    create: {
      nom: "Rakoto",
      prenom: "Jean",
      email: "client@voyage.com",
      motDePasseHash: "client123",
      telephone: "0340000000",
      roleId: clientRole.id,
    },
  });

  console.log("✅ Utilisateurs créés");

  // ==========================
  // THEME
  // ==========================
  const theme = await prisma.theme.upsert({
    where: {
      nom: "Aventure",
    },
    update: {},
    create: {
      nom: "Aventure",
    },
  });

  // ==========================
  // REGION
  // ==========================
  const region = await prisma.region.upsert({
    where: {
      nom: "Menabe",
    },
    update: {},
    create: {
      nom: "Menabe",
    },
  });

  console.log("✅ Région et thème créés");

  // ==========================
  // MODE DE PAIEMENT
  // ==========================
  await prisma.modePaiement.createMany({
    data: [
      { nom: "Espèces" },
      { nom: "Mobile Money" },
      { nom: "Carte Bancaire" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Modes de paiement créés");

  // ==========================
  // CIRCUIT
  // ==========================
  let circuit = await prisma.circuit.findFirst({
    where: {
      titre: "Les Tsingy de Bemaraha",
    },
  });

  if (!circuit) {
    circuit = await prisma.circuit.create({
  data: {
    titre: "Les Tsingy de Bemaraha",
    slug: "les-tsingy-de-bemaraha",

    description: "Circuit découverte des Tsingy.",

    dureeJours: 5,

    prixEstime: 1200,

    nbPlacesDisponibles: 15,

    estGroupe: false,

    themeId: theme.id,

    regionId: region.id,
  },
});

    await prisma.imageCircuit.create({
      data: {
        url: "https://example.com/tsingy.jpg",
        legende: "Les Tsingy",
        ordre: 1,
        circuitId: circuit.id,
      },
    });

    const hotel = await prisma.hebergement.create({
      data: {
        nom: "Hôtel Baobab",
        type: "Hôtel",
        etoiles: 3,
        adresse: "Morondava",
      },
    });

    const etape = await prisma.etape.create({
      data: {
        ordre: 1,
        ville: "Morondava",
        description: "Arrivée à Morondava",
        circuitId: circuit.id,
        hebergementId: hotel.id,
      },
    });

    await prisma.activite.create({
      data: {
        nom: "Visite des Baobabs",
        description: "Découverte de l'Allée des Baobabs",
        duree: 3,
        prix: 30,
        etapeId: etape.id,
      },
    });
  }

  console.log("✅ Circuit créé");

  console.log("🎉 Seed terminé !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 