-- Demo Phase 4: minimal indexes for scale path.
-- Future (when notifyEnabled=true rows grow): partial index on Subscription(nextRenewalDate) WHERE "notifyEnabled" = true.
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Subscription_nextRenewalDate_idx" ON "Subscription"("nextRenewalDate");
