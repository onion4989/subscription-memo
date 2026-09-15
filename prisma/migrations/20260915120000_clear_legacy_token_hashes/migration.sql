-- Legacy rows stored bcrypt digests that cannot be looked up or migrated to SHA-256.
-- Existing email verification / password-reset links become invalid; user and subscription rows are untouched.
DELETE FROM "VerificationToken";
DELETE FROM "PasswordResetToken";
