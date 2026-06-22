/** SVG 差し替え時に更新してキャッシュを無効化する */
export const GUIDE_IMAGE_VERSION = "20260620";

export type GuideStep = {
  step: number;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  cardBackgroundColor: string;
};

export const GUIDE_STEPS: GuideStep[] = [
  {
    step: 1,
    title: "アカウント登録",
    description: "下記からアカウントを登録します。",
    imageSrc: "/assets/card_step1_guide_img.svg",
    imageAlt: "アカウント登録の説明図",
    imageWidth: 155,
    imageHeight: 120,
    cardBackgroundColor: "#768A20",
  },
  {
    step: 2,
    title: "サブスク登録・変更",
    description: "契約しているサブスクを登録・変更します。",
    imageSrc: "/assets/card_step2_guide_img.svg",
    imageAlt: "サブスク登録・変更の説明図",
    imageWidth: 173,
    imageHeight: 86,
    cardBackgroundColor: "#208A73",
  },
  {
    step: 3,
    title: "お知らせメール設定",
    description: "登録時にお知らせメールを設定する便利！",
    imageSrc: "/assets/card_step3_guide_img.svg",
    imageAlt: "お知らせメール設定の説明図",
    imageWidth: 166,
    imageHeight: 144,
    cardBackgroundColor: "#C9981D",
  },
  {
    step: 4,
    title: "サブスク一覧で確認",
    description: "登録が完了したら、一覧から確認してみよう！",
    imageSrc: "/assets/card_step4_guide_img.svg",
    imageAlt: "サブスク一覧確認の説明図",
    imageWidth: 173,
    imageHeight: 118,
    cardBackgroundColor: "#8A2082",
  },
];
