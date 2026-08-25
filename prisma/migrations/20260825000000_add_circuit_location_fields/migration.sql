-- Ajout des champs de localisation GPS pour les lieux de départ et d'arrivée.
-- Colonnes peut-être déjà présentes via `prisma db push` ; on ignore si déjà existantes.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Circuit' AND column_name = 'lieuDepartNom'
  ) THEN
    ALTER TABLE "Circuit" ADD COLUMN "lieuDepartNom" TEXT;
    ALTER TABLE "Circuit" ADD COLUMN "lieuDepartLat" DECIMAL(10, 7);
    ALTER TABLE "Circuit" ADD COLUMN "lieuDepartLng" DECIMAL(10, 7);
    ALTER TABLE "Circuit" ADD COLUMN "lieuArriveeNom" TEXT;
    ALTER TABLE "Circuit" ADD COLUMN "lieuArriveeLat" DECIMAL(10, 7);
    ALTER TABLE "Circuit" ADD COLUMN "lieuArriveeLng" DECIMAL(10, 7);
  END IF;
END $$;
