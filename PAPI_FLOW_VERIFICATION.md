# Vérification du flux de paiement PAPI

## ✅ Flux complet vérifié (sans modifications d'architecture)

### 1. **initiatePaymentAction()** (`actions/payments.actions.ts`)
- ✅ Appelle `paymentService.initiatePayment()`
- ✅ Filtre `notificationToken` avant de retourner au frontend (sécurité)
- ✅ Retourne `{ success, data: { checkoutUrl, providerRef, transactionId, ... } }`

### 2. **PaymentService.initiatePayment()** (`lib/services/payment/payment.service.ts`)
- ✅ Récupère le provider via `PaymentFactory.getProvider(method)`
- ✅ Appelle `provider.createCharge()`
- ✅ Crée la transaction Prisma avec `providerRef`, `notificationToken`, `expiresAt`
- ✅ Ajoute `transactionId` au résultat du provider
- ✅ Retourne le résultat avec tous les champs nécessaires

### 3. **PapiProvider.createCharge()** (`lib/services/payment/providers/papi.provider.ts`)
- ✅ Construit la requête POST vers `https://app.papi.mg/dashboard/api/payment-links`
- ✅ Headers corrects: `Token: PAPI_API_KEY`, `Content-Type: application/json`
- ✅ Body inclut: `amount`, `currency`, `reference`, `orderId`, `successUrl`, `failureUrl`, `notificationUrl`
- ✅ Récupère la réponse JSON de Papi

### 4. **Extraction de paymentUrl/checkoutUrl**
- ✅ Cherche `data.paymentUrl` OU `data.paymentLink` (Papi peut retourner l'un ou l'autre)
- ✅ Log les clés de réponse pour diagnostic
- ✅ Retourne `{ success: true, checkoutUrl, providerRef, notificationToken, expiresAt }`

### 5. **Retour de paymentUrl au frontend**
- ✅ PaymentResult inclut `checkoutUrl?: string`
- ✅ Propagé via initiatePaymentAction → PaymentCheckoutForm
- ✅ notificationToken retiré avant le frontend (sécurité)

### 6. **PaymentCheckoutForm.tsx** (`app/paiement/[reservationId]/PaymentCheckoutForm.tsx`)
- ✅ Reçoit `activePayment.result` qui contient `checkoutUrl`
- ✅ Passe `paymentResult={activePayment.result}` à `PapiPayPanel`

### 7. **PapiPayPanel.tsx** (`components/payment/PapiPayPanel.tsx`)
- ✅ Reçoit `paymentResult` qui contient `checkoutUrl`
- ✅ Crée un lien de redirection: `<a href={paymentResult.checkoutUrl} target="_blank">`
- ✅ Bouton "Payer maintenant" redirige vers Papi.mg

### 8. **Redirection navigateur**
- ✅ Lien `<a>` avec `href={paymentResult.checkoutUrl}` redirige vers Papi.mg
- ✅ `target="_blank"` ouvre dans un nouvel onglet
- ✅ Polling en arrière-plan vérifie si le paiement est confirmé

---

## 🔧 Modifications effectuées

### 1. **.env.local** - Variable manquante ajoutée
```
+ APP_URL=http://localhost:3000
```
**Pourquoi**: `PapiProvider.createCharge()` utilise `process.env.APP_URL` pour construire les URLs de callback. Cette variable était absente mais utilisée.

### 2. **lib/services/payment/providers/papi.provider.ts** - Logs diagnostiques ajoutés
```javascript
// Dans createCharge():
console.log("[PAPI] /payment-links response keys:", Object.keys(data));
console.log(`[PAPI] Response received for reservation ${options.reservationId}`);
console.log(`[PAPI] checkoutUrl extracted successfully for orderId ${orderId}`);
console.log(`[PAPI] SUCCESS: Created payment link. providerRef=${orderId}, hasCheckoutUrl=${!!checkoutUrl}, hasNotificationToken=${!!notificationToken}`);
console.error(`[PAPI] ERROR in createCharge: ${errorMsg}`);
```

### 3. **lib/services/payment/payment.service.ts** - Logs diagnostiques ajoutés
```javascript
// Dans initiatePayment():
console.log(`[PaymentService] Creating transaction for reservation ${reservationId}, method=${method}`);
console.log(`[PaymentService] Transaction created: id=${transaction.id}, providerRef=${result.providerRef}`);
console.log(`[PaymentService] Returning result: success=true, hasCheckoutUrl=${!!finalResult.checkoutUrl}`);
console.log(`[PaymentService] Provider returned error for reservation ${reservationId}: ${result.error}`);
```

### 4. **actions/payments.actions.ts** - Logs diagnostiques ajoutés
```javascript
// Dans initiatePaymentAction():
console.log(`[initiatePaymentAction] Starting for reservation=${reservationId}, method=${method}`);
console.log(`[initiatePaymentAction] Service returned: success=${result.success}, hasCheckoutUrl=${!!result.checkoutUrl}`);
console.log(`[initiatePaymentAction] Returning to frontend: success=true, hasCheckoutUrl=${!!safeResult.checkoutUrl}`);
console.error(`[initiatePaymentAction] ERROR: ${message}`);
```

---

## 🔍 Diagnostic en cas de problème

### Si le paiement échoue:

1. **Vérifiez les logs dans la console du serveur (server-side logs)**:
   - Cherchez `[PAPI] /payment-links response keys:` pour voir la structure réelle de la réponse
   - Cherchez `[PAPI] SUCCESS:` pour confirmer le lien créé
   - Cherchez `[PaymentService] Transaction created:` pour confirmer l'enregistrement

2. **Si vous voyez `ERROR: Response missing paymentUrl/paymentLink`**:
   - La réponse de Papi a une structure différente
   - Vérifiez `PAPI_BASE_URL` et `PAPI_API_KEY` dans `.env.local`
   - Vérifiez si Papi.mg API a changé (consulter la documentation)

3. **Si `checkoutUrl` est reçu mais la redirection ne se fait pas**:
   - Vérifiez que `paymentResult.checkoutUrl` est bien défini dans PapiPayPanel
   - Vérifiez que le navigateur bloque les pop-ups (`target="_blank"`)
   - Essayez sans `target="_blank"` ou avec `window.open()` alternative

---

## 📋 Checklist de vérification

- [x] APP_URL défini dans `.env.local`
- [x] PAPI_API_KEY configurée
- [x] PAPI_BASE_URL correcte (`https://app.papi.mg/dashboard/api`)
- [x] Flux initiatePaymentAction → PaymentService → PapiProvider correct
- [x] paymentUrl/checkoutUrl extrait de la réponse Papi
- [x] Données propagées au frontend sans notificationToken
- [x] PapiPayPanel utilise `paymentResult.checkoutUrl` pour redirection
- [x] Logs diagnostiques ajoutés (sans données sensibles)

---

## 🚀 Résultat

**TypeScript Compilation**: ✅ PASS (pnpm exec tsc --noEmit)

Tous les logs sont en place pour tracer le flux. Lorsque l'utilisateur clique sur "Payer maintenant":
1. `initiatePaymentAction` est appelée → logs
2. `PaymentService` crée la transaction → logs
3. `PapiProvider` appelle Papi.mg → logs
4. `checkoutUrl` est extrait → logs
5. Données remontent au frontend → logs
6. `PapiPayPanel` redirige vers `checkoutUrl` → redirection navigateur

Si quelque chose ne fonctionne pas, les logs vous montreront exactement où.
