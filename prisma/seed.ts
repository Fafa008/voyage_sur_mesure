// prisma/seed.ts
import { PrismaClient, RoleNom } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const REGIONS_MADAGASCAR = [
  "Diana",
  "Sava",
  "Itasy",
  "Analamanga",
  "Vakinankaratra",
  "Bongolava",
  "Sofia",
  "Boeny",
  "Betsiboka",
  "Melaky",
  "Alaotra-Mangoro",
  "Atsinanana",
  "Analanjirofo",
  "Amoron'i Mania",
  "Haute Matsiatra",
  "Vatovavy",
  "Fitovinany",
  "Ihorombe",
  "Atsimo-Atsinanana",
  "Atsimo-Andrefana",
  "Androy",
  "Anosy",
  "Menabe",
  "Ambatosoa",
];

const THEMES_MADAGASCAR = [
  "Écotourisme & Biodiversité",
  "Aventure & Trekking",
  "Plages & Balnéaire",
  "Safari Baleines & Faune Marine",
  "Culture & Traditions",
  "Route Nationale 7 (RN7)",
  "Descente de Fleuve & Pirogue",
  "Lune de Miel & Évasion Romantique",
  "Gastronomie & Route des Épices",
  "Photographie & Paysages",
];

async function main() {

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


  // ==========================
  // 2. UTILISATEURS (User + Account)
  // ==========================
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
            providerId: "credential",
            accountId: "admin@voyage.com",
            password: await hashPassword("admin123"),
          },
        ],
      },
    },
  });

  // Conseiller 1
  await prisma.user.upsert({
    where: { email: "conseiller@voyage.com" },
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
          providerId: "credential",
          accountId: "conseiller@voyage.com",
          password: await hashPassword("conseiller123"),
        },
      },
    },
  });

  // Conseiller 2
  await prisma.user.upsert({
    where: { email: "conseiller2@voyage.com" },
    update: {},
    create: {
      email: "conseiller2@voyage.com",
      name: "Ravelo",
      emailVerified: true,
      prenom: "David",
      telephone: "0342222222",
      roleId: conseillerRole.id,
      accounts: {
        create: {
          providerId: "credential",
          accountId: "conseiller2@voyage.com",
          password: await hashPassword("conseiller123"),
        },
      },
    },
  });

  // Client
  await prisma.user.upsert({
    where: { email: "client@voyage.com" },
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
          providerId: "credential",
          accountId: "client@voyage.com",
          password: await hashPassword("client123"),
        },
      },
    },
  });


  // ==========================
  // 3. LES 24 RÉGIONS DE MADAGASCAR
  // ==========================
  for (const regNom of REGIONS_MADAGASCAR) {
    await prisma.region.upsert({
      where: { nom: regNom },
      update: {},
      create: { nom: regNom },
    });
  }

  const defaultRegion = await prisma.region.findUnique({
    where: { nom: "Menabe" },
  });


  // ==========================
  // 4. THÈMES RÉELS DE VOYAGE À MADAGASCAR
  // ==========================
  for (const thNom of THEMES_MADAGASCAR) {
    await prisma.theme.upsert({
      where: { nom: thNom },
      update: {},
      create: { nom: thNom },
    });
  }

  const defaultTheme = await prisma.theme.findUnique({
    where: { nom: "Aventure & Trekking" },
  });


  // ==========================
  // 5. MODES DE PAIEMENT
  // ==========================
  await prisma.modePaiement.createMany({
    data: [
      { nom: "Espèces" },
      { nom: "Mobile Money" },
      { nom: "Carte Bancaire" },
    ],
    skipDuplicates: true,
  });


  // ==========================
  // 6. CIRCUIT AVEC IMAGE, HÉBERGEMENT, ÉTAPE, ACTIVITÉ
  // ==========================
  if (defaultRegion && defaultTheme) {
    await prisma.circuit.upsert({
      where: {
        slug: "les-tsingy-de-bemaraha",
      },
      update: {},
      create: {
        titre: "Les Tsingy de Bemaraha",
        slug: "les-tsingy-de-bemaraha",
        description: "Circuit découverte spectaculaire des Tsingy du Menabe.",
        dureeJours: 5,
        prixEstime: 1200000,
        nbPlacesDisponibles: 15,
        estGroupe: false,
        themeId: defaultTheme.id,
        regionId: defaultRegion.id,

        images: {
          create: {
            url: "https://images.unsplash.com/photo-1518182170546-0766ba6f7578?w=800&q=80",
            legende: "Les Tsingy de Bemaraha",
            ordre: 1,
          },
        },

        etapes: {
          create: {
            ordre: 1,
            ville: "Morondava",
            description: "Arrivée à Morondava et visite guidée",

            hebergement: {
              create: {
                nom: "Hôtel Baobab Café",
                type: "Hôtel",
                etoiles: 3,
                adresse: "Morondava Boulevard",
              },
            },

            activites: {
              create: {
                nom: "Visite de l'Allée des Baobabs au coucher du soleil",
                description: "Découverte guidée de l'Allée des Baobabs et Baobab Amoureux",
                duree: 3,
                prix: 50000,
              },
            },
          },
        },
      },
    });

  }

}

main()
  .catch((error) => {
    console.error("❌ Erreur lors du seed :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });