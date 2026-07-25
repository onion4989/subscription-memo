import { resolveDisplayName } from "@/lib/renewal-notification/constants";

export const ACCOUNT_DELETE_CONFIRMATION_PHRASE = "アカウントを削除する";

export const ACCOUNT_DELETION_EMAIL_SUBJECT =
  "【サブスクMEMO】アカウント削除完了のお知らせ";

export function buildAccountDeletionEmailText(params: {
  displayName: string | null | undefined;
}): string {
  const displayName = resolveDisplayName(params.displayName);

  return [
    `${displayName} 様`,
    "",
    "サブスクMEMOのアカウント削除が完了しました。",
    "",
    "登録されていたプロフィールおよびサブスクリプション情報は削除され、",
    "このメールアドレスではログインできなくなります。",
    "",
    "身に覚えがない場合は、このメールを受信した旨をお問い合わせください。",
    "",
    "サブスクMEMO",
  ].join("\n");
}
