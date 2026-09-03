/**
 * 本文中で背景色付きに装飾する語の囲み記号。
 * 同じ語が別の段落にも出るため、文字列一致ではなく記号で対象を明示する。
 */
export const GUIDE_HIGHLIGHT_PATTERN = /\[\[(.+?)\]\]/g;

export function stripGuideHighlightMarkers(text: string): string {
  return text.replace(GUIDE_HIGHLIGHT_PATTERN, "$1");
}

/** 番号付き手順（「データの登録方法」のような段階説明で使用） */
export type GuideSectionStep = {
  step: number;
  title: string;
  body: readonly string[];
};

/** 実寸を持たせて枠の高さを画像の縦横比に追従させる */
export type GuideSectionImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type GuideSection = {
  id: string;
  title: string;
  body: readonly string[];
  steps?: readonly GuideSectionStep[];
  /** 本文の横に並べる説明画像 */
  image?: GuideSectionImage;
};

export const GUIDE_SECTIONS: readonly GuideSection[] = [
  {
    id: "data-registration",
    title: "データの登録方法",
    body: [
      "契約しているサブスクリプションのデータ登録は非常に簡単です。",
      "[[サブスクリプション登録・変更]] > [[+追加ボタン]] から必要なデータを入力して登録してください。データは自動的にテーブルに反映されます。また、データを登録することで更新日が近い場合は、更新間近 タグ が表示され、該当箇所のセルがハイライト表示されます。",
    ],
    steps: [
      {
        step: 1,
        title: "登録画面へ",
        body: [
          "データは、[[サブスクリプション登録・変更]]から登録します。",
          "※データの登録・変更は同じ画面、削除のみ別画面での操作となります。",
        ],
      },
      {
        step: 2,
        title: "追加ボタンを押下",
        body: [
          "[[+追加ボタン]] > [[入力フォームダイアログ]] から必要なデータを入力して登録してください。",
          "※データは自動的にテーブルに反映されます。",
          "※メールが自動的に届くためには、□お知らせ にチェックを入れてください。",
          "※データを登録することで更新日が近い場合は、更新間近 タグ が表示され、該当箇所のセルがハイライト表示されます。",
        ],
      },
      {
        step: 3,
        title: "データ確認",
        body: ["入力したデータは、[[サブスクリプション一覧画面]] から確認できます。"],
      },
    ],
  },
  {
    id: "password-change",
    title: "パスワードの変更",
    body: [
      "パスワードを変更（新規発行）する場合は、[[アカウント設定]] > [[プロフィール]]から再度設定する必要があります。その際は、[[現在のパスワード]]と[[新しいパスワード]]の両方を入力する必要があります。",
      "ただし、OAuth（Google / Github）でログインした場合は、パスワードを変更することができません。",
      "※パスワード変更欄自体が表示されなくなります。",
    ],
    image: {
      src: "/assets/pages/guide/img_guide_pass-change.webp",
      alt: "パスワード変更フォームの説明図",
      width: 600,
      height: 260,
    },
  },
  {
    id: "password-reset",
    title: "パスワードを忘れた場合",
    body: [
      "パスワードを忘れた場合は、[[ログイン画面]] >「[[パスワードをお忘れですか？]]」のリンクから再度設定してください。",
      "※ログイン画面に戻るためには、一度ログアウトしてください。",
    ],
    image: {
      src: "/assets/pages/guide/img_guide_pass-reset.webp",
      alt: "ログイン画面のパスワード再設定リンクの説明図",
      width: 600,
      height: 260,
    },
  },
  {
    id: "renewal-notice-mail",
    title: "お知らせメール設定",
    body: [
      "お知らせメール設定は、[[各種設定]] > [[お知らせ設定]]から変更できます。設定した期日になると登録されているメールアドレス宛にお知らせが届く機能です。期日は、「3日前」「5日前（デフォルト）」「7日前」の３つから選択することができます。",
      "メールが送信されるためには、データ登録時に「[[□お知らせ]]」にチェックを入れる必要があります。",
    ],
    image: {
      src: "/assets/pages/guide/img_guide_mail-setting.webp",
      alt: "お知らせメールの通知日設定の説明図",
      width: 600,
      height: 260,
    },
  },
  {
    id: "security",
    title: "セキュリティについて",
    body: [
      "MFA（2段階認証）設定は、[[各種設定]] > [[二段階認証設定]] から登録できます。",
      "スマートフォンをお持ちの場合は、MFA設定から[[QRコード]]を読み込むことで、短時間のセキュリティコードを取得することができます。このMFA設定はログインするごとに、セキュリティコードを入力する必要があることを覚えておいてください。",
      "もし、スマートフォンが破損及び紛失した場合でも大丈夫です。MFA設定時に[[10個のバックアップコード]]を提示します。このバックアップコードを使用すれば、ログインすることが可能です。",
      "※バックアップコードは設定完了時に一度だけ表示されます。コピーまたはテキスト保存で控えておいてください。各コードは1回のみ有効です。",
    ],
    image: {
      src: "/assets/pages/guide/img_guide_mfa.webp",
      alt: "二段階認証（MFA）設定の説明図",
      width: 600,
      height: 340,
    },
  },
];
