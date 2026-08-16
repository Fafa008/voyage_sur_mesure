-- Nettoyage des Devis orphelins (sans Circuit associé)
-- 1. Supprimer les dépendances de paiement des réservations liées aux devis orphelins
DELETE FROM "PaymentWebhook"
WHERE "transactionId" IN (
  SELECT t."id" FROM "PaymentTransaction" t
  JOIN "Reservation" r ON r."id" = t."reservationId"
  JOIN "Devis" d ON d."id" = r."devisId"
  WHERE d."circuitId" IS NULL
);

DELETE FROM "PaymentLog"
WHERE "transactionId" IN (
  SELECT t."id" FROM "PaymentTransaction" t
  JOIN "Reservation" r ON r."id" = t."reservationId"
  JOIN "Devis" d ON d."id" = r."devisId"
  WHERE d."circuitId" IS NULL
);

DELETE FROM "PaymentTransaction"
WHERE "reservationId" IN (
  SELECT r."id" FROM "Reservation" r
  JOIN "Devis" d ON d."id" = r."devisId"
  WHERE d."circuitId" IS NULL
);

DELETE FROM "Invoice"
WHERE "reservationId" IN (
  SELECT r."id" FROM "Reservation" r
  JOIN "Devis" d ON d."id" = r."devisId"
  WHERE d."circuitId" IS NULL
);

DELETE FROM "Paiement"
WHERE "reservationId" IN (
  SELECT r."id" FROM "Reservation" r
  JOIN "Devis" d ON d."id" = r."devisId"
  WHERE d."circuitId" IS NULL
);

-- 2. Supprimer les réservations liées aux devis orphelins
DELETE FROM "Reservation"
WHERE "devisId" IN (
  SELECT "id" FROM "Devis" WHERE "circuitId" IS NULL
);

-- 3. Supprimer les devis orphelins
DELETE FROM "Devis" WHERE "circuitId" IS NULL;

-- 4. Un Devis ne peut plus exister sans Circuit
ALTER TABLE "Devis" ALTER COLUMN "circuitId" SET NOT NULL;

-- 5. La suppression d'un Circuit supprime proprement ses Devis (cascade)
ALTER TABLE "Devis" DROP CONSTRAINT "Devis_circuitId_fkey";
ALTER TABLE "Devis" ADD CONSTRAINT "Devis_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
