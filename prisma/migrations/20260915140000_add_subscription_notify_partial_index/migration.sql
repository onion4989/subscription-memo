-- Phase1 daily job: index only notifyEnabled = true rows (smaller than a full composite).
-- Kept as raw SQL so we do not depend on the partialIndexes preview feature.
CREATE INDEX "Subscription_nextRenewalDate_notifyEnabled_idx"
ON "Subscription" ("nextRenewalDate")
WHERE "notifyEnabled" = true;
