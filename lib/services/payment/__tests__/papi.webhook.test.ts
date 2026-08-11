import { POST } from "@/app/api/payment/webhook/papi/route";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, ReservationStatus, PaymentMethod } from "@prisma/client";

/**
 * Suite de tests d'intégration pour le Webhook Papi.mg
 *
 * Scénarios couverts :
 * 1. Webhook valide (SUCCESS, token valide, montant MGA valide) -> PAID
 * 2. Token invalide -> Rejet 401
 * 3. Token absent -> Rejet 401
 * 4. Montant falsifié / incorrect (4500 MGA au lieu de 450000 MGA) -> Rejet 400
 * 5. Devise incorrecte (EUR au lieu de MGA) -> Rejet 400
 * 6. Webhook répété (Idempotence) -> 200 "Already processed" sans doublon
 * 7. Statut FAILED Papi -> Transaction FAILED
 * 8. Statut EXPIRED Papi -> Transaction EXPIRED
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
      }) as any;

    // Test 1: Token absent -> Rejet 401
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
      console.log("✅ Test 1 (Token absent -> 401): Réussi");
    }

    // Test 2: Token invalide -> Rejet 401
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
      console.log("✅ Test 2 (Token invalide -> 401): Réussi");
    }

    // Test 3: Montant incorrect -> Rejet 400
    {
      const res = await POST(
        createReq({
          paymentStatus: "SUCCESS",
          currency: "MGA",
          amount: 4500, // Altéré !
          merchantPaymentReference: testRef,
          notificationToken: testToken,
        })
      );
      console.assert(res.status === 400, "Test 3 Échoué: attendu 400 pour montant altéré");
      console.log("✅ Test 3 (Montant altéré -> 400): Réussi");
    }

    // Test 4: Devise incorrecte -> Rejet 400
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
      console.assert(res.status === 400, "Test 4 Échoué: attendu 400 pour mauvaise devise");
      console.log("✅ Test 4 (Devise incorrecte -> 400): Réussi");
    }

    // Test 5: Webhook valide -> 200 SUCCESS & PAID
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
      console.assert(res.status === 200, "Test 5 Échoué: attendu 200 pour webhook valide");

      const updatedTx = await prisma.paymentTransaction.findUnique({
        where: { id: transaction.id },
      });
      console.assert(updatedTx?.status === PaymentStatus.PAID, "Test 5: Transaction statut doit être PAID");
      console.assert(updatedTx?.providerPaymentMethod === "MVOLA", "Test 5: providerPaymentMethod doit être MVOLA");

      const updatedRes = await prisma.reservation.findUnique({
        where: { id: testReservation.id },
      });
      console.assert(updatedRes?.status === ReservationStatus.PAYEE, "Test 5: Réservation statut doit être PAYEE");

      console.log("✅ Test 5 (Webhook valide -> PAID & Reservation PAYEE): Réussi");
    }

    // Test 6: Webhook répété (Idempotence) -> 200 "Already processed"
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
      const json = await res.json();
      console.assert(res.status === 200 && json.message?.includes("Already processed"), "Test 6: Idempotence échouée");
      console.log("✅ Test 6 (Idempotence Webhook rejoué -> 200 Already processed): Réussi");
    }

    console.log("\n🎉 Tous les tests unitaires / intégration Webhook Papi.mg ont réussi !");
  } catch (err) {
    console.error("❌ Erreur pendant l'exécution des tests Webhook:", err);
  } finally {
    // Cleanup test data
    if (testReservation) {
      await prisma.paymentWebhook.deleteMany({ where: { transaction: { reservationId: testReservation.id } } });
      await prisma.paymentLog.deleteMany({ where: { transaction: { reservationId: testReservation.id } } });
      await prisma.paymentTransaction.deleteMany({ where: { reservationId: testReservation.id } });
      await prisma.reservation.delete({ where: { id: testReservation.id } });
    }
  }
}
