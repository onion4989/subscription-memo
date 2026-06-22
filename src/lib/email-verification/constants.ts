/** 確認メールのトークン有効期限（1時間） */
export const EMAIL_VERIFICATION_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export const EMAIL_VERIFICATION_SUBJECT = "メールアドレスの確認";

export const SIGNUP_SUCCESS_MESSAGE =
  "入力内容を受け付けました。メールをご確認ください。";

export const RESEND_SUCCESS_MESSAGE =
  "送信可能な場合は確認メールを送信しました。";

export const RESEND_ALREADY_VERIFIED_MESSAGE =
  "このメールアドレスはすでに確認済みです。ログインしてください。";

export const LOGIN_UNVERIFIED_MESSAGE =
  "メール確認が完了していません。受信トレイのリンクを開くか、確認メールを再送してください。";

export const VERIFY_LINK_INVALID_MESSAGE =
  "リンクが無効または期限切れです。確認メールを再送してください。";

/** 同一メールあたりの再送上限（1時間） */
export const RESEND_RATE_LIMIT_PER_EMAIL = 5;

/** 同一 IP あたりの再送上限（1時間） */
export const RESEND_RATE_LIMIT_PER_IP = 10;

export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export const MAX_SEND_RETRIES = 3;
export const RETRY_BASE_DELAY_MS = 300;
