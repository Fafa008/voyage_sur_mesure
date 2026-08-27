// app/api/internal/expire-reservations/route.ts
//
// P0.3 — Endpoint interne pour l'expiration périodique des réservations.
//
// Sécurité :
//   Protégé par CRON_SECRET via l'en-tête Authorization: Bearer <secret>.
//   Ne jamais exposer cet endpoint publiquement sans ce token.
//
// Usage (développement local) :
//   curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/internal/expire-reservations
//
// Usage Vercel Cron (vercel.json) :
//   {
//     "crons": [{
//       "path": "/api/internal/expire-reservations",
//       "schedule": "*/15 * * * *"
//     }]
//   }
//   + CRON_SECRET configuré dans les variables d'environnement Vercel
//
// Usage cron externe (GitHub Actions, cURL, etc.) :
//   0 * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" $APP_URL/api/internal/expire-reservations

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { expirationService } from "@/lib/services/payment/expiration.service";

function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  const maxLen = Math.max(bufA.length, bufB.length);
  const paddedA = Buffer.alloc(maxLen, 0);
  const paddedB = Buffer.alloc(maxLen, 0);
  bufA.copy(paddedA);
  bufB.copy(paddedB);
  return crypto.timingSafeEqual(paddedA, paddedB) && bufA.length === bufB.length;
}

/**
 * GET /api/internal/expire-reservations
 *
 * Trouve et expire toutes les PaymentTransactions PENDING/PROCESSING
 * dont expiresAt est dépassé, et libère les places du circuit associé.
 */
export async function GET(req: NextRequest) {
  // ── Vérification du token de sécurité ──────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || cronSecret.trim() === "") {
    console.error("[EXPIRE CRON] CRON_SECRET non configuré — endpoint désactivé");
    return NextResponse.json(
      { error: "Endpoint non configuré" },
      { status: 503 },
    );
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  // Comparaison basique. Pour une sécurité renforcée en production,
  // utiliser crypto.timingSafeEqual (idem P0.1). On garde ici une comparaison
  // directe car ce n'est pas un webhook externe — le token est contrôlé par
  // l'opérateur système.
  if (!token || !timingSafeCompare(token, cronSecret)) {
    console.warn("[EXPIRE CRON] Tentative d'accès non autorisé");
    return NextResponse.json(
      { error: "Non autorisé" },
      { status: 401 },
    );
  }

  // ── Exécution ──────────────────────────────────────────────────────────────
  const startTime = Date.now();
  console.log(`[EXPIRE CRON] Démarrage à ${new Date().toISOString()}`);

  try {
    const result = await expirationService.expireAllPending();
    const durationMs = Date.now() - startTime;

    console.log(
      `[EXPIRE CRON] Terminé en ${durationMs}ms —` +
      ` processed=${result.processed}` +
      ` alreadyReleased=${result.alreadyReleased}` +
      ` skippedPaid=${result.skippedPaid}` +
      ` errors=${result.errors}`,
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      durationMs,
      ...result,
      // Ne pas inclure details en production pour éviter une réponse trop volumineuse.
      // En dev, on peut les inclure pour le debugging.
      details: process.env.NODE_ENV !== "production" ? result.details : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[EXPIRE CRON] Erreur fatale:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
