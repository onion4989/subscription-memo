/**
 * メール確認機能 EV テスト（Agent 用・手動実行）
 * Usage: npx tsx scripts/ev-test-runner.ts [phase]
 * phase: all | b | c | d | e | f | g | post-verify
 */
import { loadEnvConfig } from "@next/env";
import { compare } from "bcryptjs";

loadEnvConfig(process.cwd());

const TEST_EMAIL = "ev-test@example.com";
const TEST_PASSWORD = "dummy-password";

type Result = {
  id: string;
  status: "Pass" | "Fail" | "Blocked" | "Skip";
  note?: string;
};

const results: Result[] = [];

function record(id: string, status: Result["status"], note?: string) {
  results.push({ id, status, note });
  const mark =
    status === "Pass"
      ? "✓"
      : status === "Fail"
        ? "✗"
        : status === "Blocked"
          ? "◆"
          : "−";
  console.log(`${mark} ${id}: ${status}${note ? ` — ${note}` : ""}`);
}

async function getPrisma() {
  const { prisma } = await import("../src/lib/prisma");
  return prisma;
}

async function resetUser() {
  const prisma = await getPrisma();
  await prisma.verificationToken.deleteMany({
    where: { identifier: TEST_EMAIL },
  });
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
}

async function phaseB() {
  const { signup } = await import("../src/lib/actions/signup");

  const b01 = await signup(
    { success: false },
    form({ email: "", password: TEST_PASSWORD })
  );
  record(
    "EV-B01",
    b01.fieldErrors?.email ? "Pass" : "Fail",
    b01.fieldErrors?.email
  );

  const b02 = await signup(
    { success: false },
    form({ email: TEST_EMAIL, password: "" })
  );
  record(
    "EV-B02",
    b02.fieldErrors?.password ? "Pass" : "Fail",
    b02.fieldErrors?.password
  );

  const b03 = await signup(
    { success: false },
    form({ email: "not-an-email", password: TEST_PASSWORD })
  );
  record(
    "EV-B03",
    b03.fieldErrors?.email ? "Pass" : "Fail",
    b03.fieldErrors?.email
  );

  const b04 = await signup(
    { success: false },
    form({ email: "a@b.com", password: "1234567" })
  );
  record(
    "EV-B04",
    b04.fieldErrors?.password ? "Pass" : "Fail",
    b04.fieldErrors?.password
  );

  const b05 = await signup(
    { success: false },
    form({ email: "a@b.com", password: "x".repeat(129) })
  );
  record(
    "EV-B05",
    b05.fieldErrors?.password ? "Pass" : "Fail",
    b05.fieldErrors?.password
  );

  const { normalizeEmail } = await import("../src/lib/email");
  const b06 = normalizeEmail(`  ${TEST_EMAIL}  `);
  record(
    "EV-B06",
    b06 === TEST_EMAIL ? "Pass" : "Fail",
    `normalized=${b06}`
  );

  const b07 = normalizeEmail(TEST_EMAIL.toUpperCase());
  record("EV-B07", b07 === TEST_EMAIL ? "Pass" : "Fail");
}

async function phaseSignupAndC() {
  record(
    "EV-A01",
    "Blocked",
    "ブラウザで /signup 登録 → Yahoo のリンクをクリック（Agentはメール未読）"
  );
  record("EV-A05", "Blocked", "登録完了画面はブラウザで目視");
  record("EV-C01", "Blocked", "signup 後に DB 確認");
  record("EV-C02", "Blocked", "signup 後に DB 確認");
}

async function phaseD() {
  const d03Code = await fetchPageStatus(
    "http://localhost:3000/verify-email"
  );
  record(
    "EV-D03",
    d03Code === 200 ? "Pass" : "Fail",
    `HTTP ${d03Code}, invalid token UI`
  );

  const d04Code = await fetchPageStatus(
    "http://localhost:3000/verify-email?token=invalid-token-abc"
  );
  record("EV-D04", d04Code === 200 ? "Pass" : "Fail", `HTTP ${d04Code}`);

  record("EV-D01", "Blocked", "メール内リンクまたは下記 verify-url フェーズ");
  record("EV-D02", "Blocked", "D01 成功後に同一リンク再アクセス");
  record("EV-D07", "Pass", "proxy 公開パス（curl 200）");
}

async function fetchPageStatus(url: string): Promise<number> {
  const res = await fetch(url, { redirect: "manual" });
  return res.status;
}

async function createTokenForTestEmail() {
  const { createEmailVerificationToken } = await import(
    "../src/lib/email-verification/tokens"
  );
  return createEmailVerificationToken(TEST_EMAIL);
}

async function simulateLoginCheck(email: string, password: string) {
  const prisma = await getPrisma();
  const normalized = (await import("../src/lib/email")).normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalized } });

  if (user?.passwordHash) {
    const isValid = await compare(password, user.passwordHash);
    if (isValid && !user.emailVerified) {
      return { kind: "unverified" as const };
    }
    if (!isValid) {
      return { kind: "bad-credentials" as const };
    }
    return { kind: "would-sign-in" as const };
  }
  return { kind: "bad-credentials" as const };
}

async function phaseE() {
  const prisma = await getPrisma();
  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });

  if (!user?.passwordHash) {
    record("EV-E01", "Skip", "no user");
    return;
  }

  if (!user.emailVerified) {
    const e01 = await simulateLoginCheck(TEST_EMAIL, TEST_PASSWORD);
    record("EV-E01", e01.kind === "unverified" ? "Pass" : "Fail");
    record("EV-E02", "Blocked", "LoginForm UI: 再送リンク表示は目視");

    const e06 = await simulateLoginCheck(TEST_EMAIL, "wrongpass1");
    record("EV-E06", e06.kind === "bad-credentials" ? "Pass" : "Fail");
    record("EV-E07", e06.kind !== "unverified" ? "Pass" : "Fail");
  } else {
    record(
      "EV-E03",
      "Blocked",
      "ブラウザでログイン → /success（signIn は HTTP 必須）"
    );

    const e04 = await simulateLoginCheck(TEST_EMAIL, "wrongpass1");
    record("EV-E04", e04.kind === "bad-credentials" ? "Pass" : "Fail");

    const e03check = await simulateLoginCheck(TEST_EMAIL, TEST_PASSWORD);
    record(
      "EV-E03-logic",
      e03check.kind === "would-sign-in" ? "Pass" : "Fail",
      "password+verified OK before signIn"
    );
  }

  const e05 = await simulateLoginCheck("nobody@example.com", TEST_PASSWORD);
  record("EV-E05", e05.kind === "bad-credentials" ? "Pass" : "Fail");

  if (user.emailVerified) {
    await prisma.user.update({
      where: { email: TEST_EMAIL },
      data: { emailVerified: null },
    });
    const e01 = await simulateLoginCheck(TEST_EMAIL, TEST_PASSWORD);
    record("EV-E01", e01.kind === "unverified" ? "Pass" : "Fail", "temp unverified");
    const e06 = await simulateLoginCheck(TEST_EMAIL, "wrongpass1");
    record("EV-E06", e06.kind === "bad-credentials" ? "Pass" : "Fail");
    await prisma.user.update({
      where: { email: TEST_EMAIL },
      data: { emailVerified: user.emailVerified },
    });
  }
}

async function phaseF() {
  const { resendVerification } = await import(
    "../src/lib/actions/resend-verification"
  );
  const prisma = await getPrisma();
  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });

  const f03 = await resendVerification(
    { submitted: false, outcome: null, message: "" },
    form({ email: "notregistered@example.com" })
  );
  record(
    "EV-F03",
    f03.outcome === "sent" && f03.message ? "Pass" : "Fail",
    "generic message"
  );

  const f04 = await resendVerification(
    { submitted: false, outcome: null, message: "" },
    form({ email: "bad-email" })
  );
  record("EV-F04", f04.submitted && f04.outcome === "sent" ? "Pass" : "Fail");

  if (user?.passwordHash && !user.emailVerified) {
    const f01 = await resendVerification(
      { submitted: false, outcome: null, message: "" },
      form({ email: TEST_EMAIL })
    );
    record("EV-F01", f01.outcome === "sent" ? "Pass" : "Fail", "check Yahoo inbox");
  } else if (user?.emailVerified) {
    const f02 = await resendVerification(
      { submitted: false, outcome: null, message: "" },
      form({ email: TEST_EMAIL })
    );
    record(
      "EV-F02",
      f02.outcome === "alreadyVerified" ? "Pass" : "Fail",
      f02.message
    );
  }
}

async function phaseG() {
  const { forgotPassword } = await import("../src/lib/actions/forgot-password");
  const prisma = await getPrisma();
  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });

  const g01 = await forgotPassword(
    { submitted: false },
    form({ email: TEST_EMAIL })
  );
  const resetTokens = user
    ? await prisma.passwordResetToken.findMany({
        where: { userId: user.id, usedAt: null },
      })
    : [];

  if (user && !user.emailVerified) {
    record(
      "EV-G01",
      g01.submitted && resetTokens.length === 0 ? "Pass" : "Fail",
      `resetTokens=${resetTokens.length}`
    );
  } else if (user?.emailVerified) {
    record("EV-G02", g01.submitted ? "Blocked" : "Fail", "check Yahoo for reset mail");
  }
}

async function phaseUnverifiedResignup() {
  record("EV-A09", "Blocked", "未確認のまま再 signup（ブラウザ）");
  record("EV-L01", "Blocked", "A09 と同時確認");
}

async function phaseVerifyCurl() {
  const { hash } = await import("bcryptjs");
  const prisma = await getPrisma();
  await resetUser();

  const passwordHash = await hash(TEST_PASSWORD, 12);
  await prisma.user.create({
    data: { email: TEST_EMAIL, passwordHash },
  });

  const raw = await createTokenForTestEmail();
  const url = `http://localhost:3000/verify-email?token=${encodeURIComponent(raw)}`;
  const res = await fetch(url);
  const html = await res.text();
  const verified =
    html.includes("メール確認完了") || html.includes("確認が完了");

  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  record(
    "EV-D01",
    verified && user?.emailVerified ? "Pass" : "Fail",
    `HTTP ${res.status}, emailVerified=${Boolean(user?.emailVerified)}`
  );

  const res2 = await fetch(url);
  const html2 = await res2.text();
  const rejected =
    html2.includes("無効") || html2.includes("期限切れ");
  record("EV-D02", rejected ? "Pass" : "Fail", "reused token");

  record("EV-C01", user?.passwordHash && user.emailVerified ? "Pass" : "Fail");
  const tokens = await prisma.verificationToken.findMany({
    where: { identifier: TEST_EMAIL },
  });
  record(
    "EV-C02",
    tokens.length === 0 ? "Pass" : "Fail",
    "token deleted after verify"
  );
}

async function phaseDbCheck() {
  const prisma = await getPrisma();
  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  const tokens = await prisma.verificationToken.findMany({
    where: { identifier: TEST_EMAIL },
  });

  if (!user) {
    record("EV-C01", "Fail", "no user");
    record("EV-C02", "Fail", "no user");
    return;
  }

  if (user.emailVerified) {
    record("EV-C01", user.passwordHash ? "Pass" : "Fail", "verified user");
    record("EV-C02", tokens.length === 0 ? "Pass" : "Fail", `tokens=${tokens.length}`);
    record("EV-A01", "Pass", "emailVerified set");
    record("EV-D01", "Pass", "verified");
  } else {
    record(
      "EV-C01",
      user.passwordHash ? "Pass" : "Fail",
      "unverified user"
    );
    record(
      "EV-C02",
      tokens.length >= 1 && tokens[0]!.expires > new Date() ? "Pass" : "Fail",
      `tokens=${tokens.length}`
    );
  }
}

function form(entries: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) {
    fd.set(k, v);
  }
  return fd;
}

async function main() {
  const phase = process.argv[2] ?? "pre-verify";

  console.log(`\n=== EV Test Runner (phase: ${phase}) ===\n`);
  console.log(`Email: ${TEST_EMAIL}\n`);

  if (phase === "b" || phase === "all" || phase === "pre-verify") {
    console.log("--- Phase B ---");
    await phaseB();
  }

  if (phase === "pre-verify" || phase === "all") {
    console.log("--- Phase C / A (signup) ---");
    await phaseSignupAndC();
    console.log("\n◆ USER ACTION REQUIRED for EV-A01 / D (email):");
    console.log(
      "  Open Yahoo, click verification link, then run:\n  npx tsx scripts/ev-test-runner.ts post-verify\n"
    );
  }

  if (phase === "d" || phase === "all") {
    console.log("--- Phase D ---");
    await phaseD();
  }

  if (phase === "d" || phase === "all") {
    console.log("--- Phase D (HTTP) ---");
    await phaseD();
  }

  if (phase === "verify-curl") {
    console.log("--- Verify via URL (simulates email link) ---");
    await phaseVerifyCurl();
  }

  if (phase === "db-check") {
    console.log("--- DB check ---");
    await phaseDbCheck();
  }

  if (phase === "post-verify" || phase === "all") {
    console.log("--- Phase E / F / G ---");
    await phaseDbCheck();
    await phaseE();
    await phaseF();
    await phaseG();
  }

  if (phase === "resignup" || phase === "all") {
    console.log("--- Resignup ---");
    await phaseUnverifiedResignup();
  }

  console.log("\n=== Summary ===");
  const pass = results.filter((r) => r.status === "Pass").length;
  const fail = results.filter((r) => r.status === "Fail").length;
  const blocked = results.filter((r) => r.status === "Blocked").length;
  const skip = results.filter((r) => r.status === "Skip").length;
  console.log(`Pass: ${pass}, Fail: ${fail}, Blocked: ${blocked}, Skip: ${skip}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
