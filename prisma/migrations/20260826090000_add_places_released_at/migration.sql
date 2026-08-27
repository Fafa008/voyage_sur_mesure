-- P0.3 : Ajout du champ placesReleasedAt sur Reservation
-- Verrou idempotent pour la libération des places lors de l'expiration d'un paiement.
-- Si ce champ est non-null, les places ont déjà été restituées et
-- toute nouvelle tentative de libération doit être ignorée (idempotence).

ALTER TABLE "Reservation" ADD COLUMN "placesReleasedAt" TIMESTAMP(3);
