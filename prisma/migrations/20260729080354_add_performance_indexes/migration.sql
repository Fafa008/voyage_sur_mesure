-- CreateIndex
CREATE INDEX "Avis_circuitId_idx" ON "Avis"("circuitId");

-- CreateIndex
CREATE INDEX "Avis_userId_idx" ON "Avis"("userId");

-- CreateIndex
CREATE INDEX "ImageCircuit_circuitId_idx" ON "ImageCircuit"("circuitId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_lu_idx" ON "Notification"("lu");
