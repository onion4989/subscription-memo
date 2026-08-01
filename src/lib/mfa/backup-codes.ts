import { randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const BACKUP_CODE_COUNT = 10;
export const BACKUP_CODE_LENGTH = 10;

const BCRYPT_ROUNDS = 10;

/** Crockford Base32。I / L / O / U を除くため手書き転記でも取り違えにくい */
const BACKUP_CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** 表示時にハイフンで区切る文字数（10 文字なら 4-4-2） */
const BACKUP_CODE_GROUP_SIZE = 4;

/** アルファベットから外した文字を Crockford の慣例に沿って読み替える */
const AMBIGUOUS_CHARACTER_MAP: Record<string, string> = {
  O: "0",
  I: "1",
  L: "1",
};

export type PreparedBackupCodes = {
  /** 表示用に整形した平文。発行直後の一度だけユーザーへ提示できる */
  codes: string[];
  /** `BackupCode` へ挿入する行。呼び出し側でトランザクションに含める */
  rows: { userId: string; codeHash: string }[];
};

function generateBackupCode(): string {
  const bytes = randomBytes(BACKUP_CODE_LENGTH);
  let code = "";

  for (const byte of bytes) {
    // 256 は 32 で割り切れるため剰余バイアスが出ない
    code += BACKUP_CODE_ALPHABET[byte % BACKUP_CODE_ALPHABET.length];
  }

  return code;
}

export function generateBackupCodes(count: number = BACKUP_CODE_COUNT): string[] {
  const codes = new Set<string>();

  while (codes.size < count) {
    codes.add(generateBackupCode());
  }

  return [...codes];
}

/** 入力のゆれ（小文字・ハイフン・空白・紛らわしい文字）を吸収して保存形式へ戻す */
export function normalizeBackupCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .split("")
    .map((character) => AMBIGUOUS_CHARACTER_MAP[character] ?? character)
    .join("");
}

export function formatBackupCode(code: string): string {
  const groups: string[] = [];

  for (let index = 0; index < code.length; index += BACKUP_CODE_GROUP_SIZE) {
    groups.push(code.slice(index, index + BACKUP_CODE_GROUP_SIZE));
  }

  return groups.join("-");
}

/**
 * 平文コードと保存用ハッシュを生成する。
 * 書き込みは呼び出し側のトランザクションに含めることで、
 * MFA 有効化とコード発行が中途半端に片方だけ成功しないようにする。
 */
export async function prepareBackupCodes(
  userId: string
): Promise<PreparedBackupCodes> {
  const rawCodes = generateBackupCodes();

  const rows = await Promise.all(
    rawCodes.map(async (rawCode) => ({
      userId,
      codeHash: await hash(rawCode, BCRYPT_ROUNDS),
    }))
  );

  return { codes: rawCodes.map(formatBackupCode), rows };
}

/** 未使用コードと照合し、一致した 1 件だけを使用済みにする */
export async function consumeBackupCode(
  userId: string,
  rawCode: string
): Promise<boolean> {
  const normalized = normalizeBackupCode(rawCode);

  if (normalized.length !== BACKUP_CODE_LENGTH) {
    return false;
  }

  const candidates = await prisma.backupCode.findMany({
    where: { userId, usedAt: null },
    select: { id: true, codeHash: true },
  });

  for (const candidate of candidates) {
    const isMatch = await compare(normalized, candidate.codeHash);

    if (!isMatch) {
      continue;
    }

    // 同時送信で同じコードが二度使われないよう、未使用のままの行だけを更新する
    const { count } = await prisma.backupCode.updateMany({
      where: { id: candidate.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    return count === 1;
  }

  return false;
}
