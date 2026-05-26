/**
 * OAuthAccountNotLinked 時の /login クエリと表示文言（既存のサインイン方法を UX 用に示す）
 */

export const LOGIN_OAUTH_NOT_LINKED_QUERY = {
  linkedProviders: "linkedProviders",
  credentialLogin: "credentialLogin",
} as const;

const OAUTH_PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
};

const KNOWN_OAUTH_IDS = new Set(Object.keys(OAUTH_PROVIDER_LABELS));

export function collectKnownLinkedOAuthProviderIds(
  accounts: { provider: string }[]
): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const { provider } of accounts) {
    if (!KNOWN_OAUTH_IDS.has(provider) || seen.has(provider)) continue;
    seen.add(provider);
    ordered.push(provider);
  }
  return ordered;
}

export function parseLinkedOAuthProvidersQuery(
  param: string | undefined
): string[] {
  if (!param?.trim()) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of param.split(",")) {
    const id = raw.trim();
    if (!KNOWN_OAUTH_IDS.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function labelsForProviderIds(ids: string[]): string[] {
  return ids.map((id) => OAUTH_PROVIDER_LABELS[id]).filter(Boolean);
}

function joinJapaneseOr(labels: string[]): string {
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} または ${labels[1]}`;
  const head = labels.slice(0, -1).join("、");
  return `${head}、または ${labels[labels.length - 1]}`;
}

function parseCredentialLoginFlag(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

/**
 * OAuthAccountNotLinked 用のユーザー向けメッセージ。クエリが不正・空のときは null（汎用文にフォールバック）
 */
export function buildOAuthAccountNotLinkedDisplayMessage(
  linkedProviderIds: string[],
  hasCredentialLogin: boolean
): string | null {
  const oauthLabels = labelsForProviderIds(linkedProviderIds);
  const hasOAuth = oauthLabels.length > 0;

  if (!hasOAuth && !hasCredentialLogin) {
    return null;
  }

  if (hasOAuth && !hasCredentialLogin) {
    if (oauthLabels.length === 1) {
      const name = oauthLabels[0];
      return `このアカウントはすでに ${name} で登録されています。${name} でログインしてください。`;
    }
    const joined = joinJapaneseOr(oauthLabels);
    return `このアカウントはすでに ${joined} で登録されています。いずれかの方法でログインしてください。`;
  }

  if (!hasOAuth && hasCredentialLogin) {
    return "このアカウントはすでにメールアドレスとパスワードで登録されています。メールアドレスとパスワードでログインしてください。";
  }

  const oauthJoined = joinJapaneseOr(oauthLabels);
  return `このアカウントはすでに ${oauthJoined}、またはメールアドレスとパスワードで登録されています。いずれかの方法でログインしてください。`;
}

export function resolveOAuthAccountNotLinkedMessageFromQuery(params: {
  linkedProviders?: string;
  credentialLogin?: string;
}): string | null {
  const ids = parseLinkedOAuthProvidersQuery(params.linkedProviders);
  const hasCred = parseCredentialLoginFlag(params.credentialLogin);
  return buildOAuthAccountNotLinkedDisplayMessage(ids, hasCred);
}
