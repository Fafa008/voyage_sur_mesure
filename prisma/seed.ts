// prisma/seed.ts
import { PrismaClient, RoleNom } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
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
  // 1. RÔLES
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
  const conseillerRole = await prisma.role.findUnique({
    where: { nom: RoleNom.conseiller },
  });
  const clientRole = await prisma.role.findUnique({
    where: { nom: RoleNom.client },
  });

  if (!adminRole || !conseillerRole || !clientRole) {
    throw new Error("Impossible de récupérer les rôles.");
  }

  console.log("✅ Rôles créés");

  // ==========================
  // 2. UTILISATEURS (User + Account)
  // ==========================
  // Fonction utilitaire pour hacher un mot de passe (compatible Better Auth)
const hashPassword = async (plain: string) => {
  return bcrypt.hash(plain, 12);
};

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@voyage.com" },
    update: {},
    create: {
      email: "admin@voyage.com",
      name: "Administrateur",
      prenom: "System",
      emailVerified: true,
      telephone: null,
      roleId: adminRole.id,
      accounts: {
        create: [
          {
            // id: "admin-account",
            providerId: "credential",
            accountId: "admin@voyage.com",
            password: await hashPassword("admin123"),
          },
        ],
      },
    },
  });

  // Conseiller
  await prisma.user.upsert({
    where: { email: "conseiller@voyage.com"},
    update: {},
    create: {
      email: "conseiller@voyage.com",
      name: "Conseiller",
      emailVerified: true,
      prenom: "Marie",
      telephone: "0341111111",
      roleId: conseillerRole.id,
      accounts: {
        create: {
          // id: "conseiller-account",
          providerId: "credential",
          accountId: "conseiller@voyage.com",
          password: await hashPassword("conseiller123"),
        },
      },
    },
  });

  // Client
  await prisma.user.upsert({
    where: { email: "client@voyage.com"},
    update: {},
    create: {
      email: "client@voyage.com",
      name: "Rakoto",
      emailVerified: true,
      prenom: "Jean",
      telephone: "0340000000",
      roleId: clientRole.id,
      accounts: {
        create: {
          // id: "client-account",
          providerId: "credential",
          accountId: "client@voyage.com",
          password: await hashPassword("client123"),
        },
      },
    },
  });

  console.log("✅ Utilisateurs et comptes créés");

  // ==========================
  // 3. THÈME & RÉGION
  // ==========================
  const theme = await prisma.theme.upsert({
    where: { nom: "Aventure" },
    update: {},
    create: { nom: "Aventure" },
  });

  const region = await prisma.region.upsert({
    where: { nom: "Menabe" },
    update: {},
    create: { nom: "Menabe" },
  });

  console.log("✅ Thème et région créés");

  // ==========================
  // 4. MODES DE PAIEMENT
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
  // 5. CIRCUIT AVEC IMAGE, HÉBERGEMENT, ÉTAPE, ACTIVITÉ
  // ==========================
await prisma.circuit.upsert({
  where: {
    slug: "les-tsingy-de-bemaraha",
  },
  update: {},
  create: {
    titre: "Les Tsingy de Bemaraha",
    slug: "les-tsingy-de-bemaraha",
    description: "Circuit découverte des Tsingy.",
    dureeJours: 5,
    prixEstime: 1200,
    nbPlacesDisponibles: 15,
    estGroupe: false,
    themeId: theme.id,
    regionId: region.id,

    images: {
      create: {
        url: "https://example.com/tsingy.jpg",
        legende: "Les Tsingy",
        ordre: 1,
      },
    },

    etapes: {
      create: {
        ordre: 1,
        ville: "Morondava",
        description: "Arrivée à Morondava",

        hebergement: {
          create: {
            nom: "Hôtel Baobab",
            type: "Hôtel",
            etoiles: 3,
            adresse: "Morondava",
          },
        },

        activites: {
          create: {
            nom: "Visite des Baobabs",
            description: "Découverte de l'Allée des Baobabs",
            duree: 3,
            prix: 30,
          },
        },
      },
    },
  },
});

  console.log("✅ Circuit créé avec ses étapes et hébergements");

  console.log("🎉 Seed terminé avec succès !");
}

main()
  .catch((error) => {
  console.error("❌ Erreur lors du seed :", error);
  process.exit(1);
})
  .finally(async () => {
    await prisma.$disconnect();
  });