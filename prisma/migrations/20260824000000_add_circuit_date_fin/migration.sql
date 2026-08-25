-- Ajout de la date de retour estimée du circuit (complète dateDebut).
-- Migration appliquée via `npx prisma db push` (l'historique de migrations
-- présente un drift préexistant ; ne pas lancer `migrate dev` sans baseline).
ALTER TABLE "Circuit" ADD COLUMN "dateFin" TIMESTAMP(3);
