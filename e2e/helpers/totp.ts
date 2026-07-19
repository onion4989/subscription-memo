import { TOTP, Secret } from "otpauth";

/** Matches app TOTP settings in `src/lib/mfa/totp.ts`. */
export function generateTotpCode(secretBase32: string): string {
  const totp = new TOTP({
    issuer: "Authentication",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });
  return totp.generate();
}
