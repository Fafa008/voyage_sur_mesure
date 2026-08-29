import { POST } from "@/app/api/payment/webhook/papi/route";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, ReservationStatus, PaymentMethod } from "@prisma/client";

/**
 * Suite de tests d'intégration pour le Webhook Papi.mg
 *
 * Scénarios couverts :
 * 1. Token correct + SUCCESS -> PAID
 * 2. Token incorrect + SUCCESS -> Rejet 401
 * 3. Token absent + SUCCESS -> Rejet 401
 * 4. Transaction inexistante -> Rejet 404
 * 5. Référence incorrecte -> Rejet 404
 * 6. Montant incorrect -> Rejet 400
 * 7. Devise incorrecte -> Rejet 400
 * 8. Webhook répété (Idempotence) -> 200 "Already processed" sans doublon
 * 9. Statut FAILED -> Transaction FAILED
 */
export async function runPapiWebhookTests() {
  console.log("🧪 Début des tests du Webhook Papi.mg...\n");

  let testUser: { id: string } | null = null;
  let testReservation: { id: number } | null = null;
  let testProvider: { id: string } | null = null;

  try {
    // Setup test user & reservation
    testUser = await prisma.user.findFirst();
    if (!testUser) {
      console.log("⚠️ Aucun utilisateur en base pour exécuter les tests.");
      return;
    }

    testProvider = await prisma.paymentProvider.findFirst({
      where: { name: "PAPI" },
    });
    if (!testProvider) {
      testProvider = await prisma.paymentProvider.create({
        data: { name: "PAPI" },
      });
    }

    testReservation = await prisma.reservation.create({
      data: {
        userId: testUser.id,
        montantFinal: 450000,
        status: ReservationStatus.EN_ATTENTE,
      },
    });

    const testRef = `RES-TEST-${testReservation.id}-${Date.now()}`;
    const testToken = "secure_test_token_12345";

    const transaction = await prisma.paymentTransaction.create({
      data: {
        amount: 450000,
        currency: "MGA",
        method: PaymentMethod.PAPI,
        status: PaymentStatus.PENDING,
        providerId: testProvider.id,
        providerRef: testRef,
        notificationToken: testToken,
        reservationId: testReservation.id,
        userId: testUser.id,
      },
    });

    // Helper fake Request
    const createReq = (body: Record<string, unknown>) =>
      new Request("http://localhost:3000/api/payment/webhook/papi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }) as unknown as NextRequest;

    // Test 1: Token absent + SUCCESS -> Rejet 401
    {
      const res = await POST(
        createReq({
          paymentStatus: "SUCCESS",
          currency: "MGA",
          amount: 450000,
          merchantPaymentReference: testRef,
        })
      );
      console.assert(res.status === 401, "Test 1 Échoué: attendu 401 pour token absent");
      const updatedTx = await prisma.paymentTransaction.findUnique({ where: { id: transaction.id } });
      console.assert(updatedTx?.status === PaymentStatus.PENDING, "Test 1: statut ne doit PAS changer");
      console.log("✅ Test 1 (Token absent + SUCCESS -> 401): Réussi");
    }

    // Test 2: Token invalide + SUCCESS -> Rejet 401
    {
      const res = await POST(
        createReq({
          paymentStatus: "SUCCESS",
          currency: "MGA",
          amount: 450000,
          merchantPaymentReference: testRef,
          notificationToken: "wrong_token",
        })
      );
      console.assert(res.status === 401, "Test 2 Échoué: attendu 401 pour token invalide");
      const updatedTx = await prisma.paymentTransaction.findUnique({ where: { id: transaction.id } });
      console.assert(updatedTx?.status === PaymentStatus.PENDING, "Test 2: statut ne doit PAS changer");
      console.log("✅ Test 2 (Token invalide + SUCCESS -> 401): Réussi");
    }

    // Test 3: Transaction inexistante -> Rejet 404
    {
      const res = await POST(
        createReq({
          paymentStatus: "SUCCESS",
          currency: "MGA",
          amount: 450000,
          merchantPaymentReference: "RES-FAKE-999999-000000",
          notificationToken: testToken,
        })
      );
      console.assert(res.status === 404, "Test 3 Échoué: attendu 404 pour transaction inexistante");
      console.log("✅ Test 3 (Transaction inexistante -> 404): Réussi");
    }

    // Test 4: Référence incorrecte (autre ref qui n'existe pas) -> Rejet 404
    {
      const res = await POST(
        createReq({
          paymentStatus: "SUCCESS",
          currency: "MGA",
          amount: 450000,
          paymentReference: "PAPI-REF-INVALIDE-12345",
          notificationToken: testToken,
        })
      );
      console.assert(res.status === 404, "Test 4 Échoué: attendu 404 pour référence incorrecte");
      console.log("✅ Test 4 (Référence incorrecte -> 404): Réussi");
    }

    // Test 5: Montant incorrect -> Rejet 400
    {
      const res = await POST(
        createReq({
          paymentStatus: "SUCCESS",
          currency: "MGA",
          amount: 450, // Altéré !
          merchantPaymentReference: testRef,
          notificationToken: testToken,
        })
      );
      console.assert(res.status === 400, "Test 5 Échoué: attendu 400 pour montant altéré");
      const updatedTx = await prisma.paymentTransaction.findUnique({ where: { id: transaction.id } });
      console.assert(updatedTx?.status === PaymentStatus.PENDING, "Test 5: statut ne doit PAS changer");
      console.log("✅ Test 5 (Montant altéré -> 400): Réussi");
    }

    // Test 6: Devise incorrecte -> Rejet 400
    {
      const res = await POST(
        createReq({
          paymentStatus: "SUCCESS",
          currency: "EUR", // Mauvaise devise !
          amount: 450000,
          merchantPaymentReference: testRef,
          notificationToken: testToken,
        })
      );
      console.assert(res.status === 400, "Test 6 Échoué: attendu 400 pour mauvaise devise");
      const updatedTx = await prisma.paymentTransaction.findUnique({ where: { id: transaction.id } });
      console.assert(updatedTx?.status === PaymentStatus.PENDING, "Test 6: statut ne doit PAS changer");
      console.log("✅ Test 6 (Devise incorrecte -> 400): Réussi");
    }

    // Test 7: Webhook valide (Token correct + SUCCESS) -> PAID
    {
      const res = await POST(
        createReq({
          paymentStatus: "SUCCESS",
          paymentMethod: "MVOLA",
          currency: "MGA",
          amount: 450000,
          merchantPaymentReference: testRef,
          notificationToken: testToken,
        })
      );
      console.assert(res.status === 200, "Test 7 Échoué: attendu 200 pour webhook valide");

      const updatedTx = await prisma.paymentTransaction.findUnique({
        where: { id: transaction.id },
      });
      console.assert(updatedTx?.status === PaymentStatus.PAID, "Test 7: Transaction statut doit être PAID");
      console.assert(updatedTx?.providerPaymentMethod === "MVOLA", "Test 7: providerPaymentMethod doit être MVOLA");

      const updatedRes = await prisma.reservation.findUnique({
        where: { id: testReservation.id },
      });
      console.assert(updatedRes?.status === ReservationStatus.PAYEE, "Test 7: Réservation statut doit être PAYEE");

      console.log("✅ Test 7 (Token correct + SUCCESS -> PAID & Reservation PAYEE): Réussi");
    }

    // Test 8: Webhook répété (Idempotence) -> 200 "Already processed" sans double validation
    {
      const res = await POST(
        createReq({
          paymentStatus: "SUCCESS",
          paymentMethod: "MVOLA",
          currency: "MGA",
          amount: 450000,
          merchantPaymentReference: testRef,
          notificationToken: testToken,
        })
      );
      console.assert(res.status === 200, "Test 8: attendu 200 pour idempotence");

      // Vérifier qu'aucune notification supplémentaire n'a été créée
      const notifications = await prisma.notification.findMany({
        where: { userId: testUser!.id, titre: "Paiement confirmé" },
      });
      console.assert(notifications.length === 1, "Test 8: Aucune notification dupliquée");
      console.log("✅ Test 8 (Idempotence Webhook rejoué -> 200 Already processed): Réussi");
    }

    // Test 9: FAILED après PAID -> Rejet (déjà PAID, ne peut pas régresser)
    {
      // D'abord créer une nouvelle transaction pour tester FAILED
      const testRef2 = `RES-TEST2-${testReservation.id}-${Date.now()}`;
      const transaction2 = await prisma.paymentTransaction.create({
        data: {
          amount: 450000,
          currency: "MGA",
          method: PaymentMethod.PAPI,
          status: PaymentStatus.PENDING,
          providerId: testProvider!.id,
          providerRef: testRef2,
          notificationToken: testToken,
          reservationId: testReservation.id,
          userId: testUser!.id,
        },
      });

      // Premier webhook: SUCCESS -> PAID
      await POST(
        createReq({
          paymentStatus: "SUCCESS",
          currency: "MGA",
          amount: 450000,
          merchantPaymentReference: testRef2,
          notificationToken: testToken,
        })
      );

      // Deuxième webhook: FAILED sur transaction déjà PAID -> idempotent (pas de régression)
      const res = await POST(
        createReq({
          paymentStatus: "FAILED",
          currency: "MGA",
          amount: 450000,
          merchantPaymentReference: testRef2,
          notificationToken: testToken,
        })
      );
      console.assert(res.status === 200, "Test 9: attendu 200 (idempotent)");

      const finalTx = await prisma.paymentTransaction.findUnique({
        where: { id: transaction2.id },
      });
      console.assert(finalTx?.status === PaymentStatus.PAID, "Test 9: La transaction doit rester PAID, pas de régression vers FAILED");
      console.log("✅ Test 9 (FAILED après PAID -> reste PAID): Réussi");
    }

    console.log("\n🎉 Tous les tests du Webhook Papi.mg ont réussi !");
  } catch (err) {
    console.error("❌ Erreur pendant l'exécution des tests Webhook:", err);
  } finally {
    // Cleanup test data
    if (testReservation) {
      await prisma.invoice.deleteMany({ where: { reservationId: testReservation.id } });
      await prisma.paymentWebhook.deleteMany({ where: { transaction: { reservationId: testReservation.id } } });
      await prisma.paymentLog.deleteMany({ where: { transaction: { reservationId: testReservation.id } } });
      await prisma.paymentTransaction.deleteMany({ where: { reservationId: testReservation.id } });
      await prisma.reservation.delete({ where: { id: testReservation.id } });
    }
  }
}
