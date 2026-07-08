/** ガイド画像差し替え時に更新してキャッシュを無効化する */
export const GUIDE_IMAGE_VERSION = "20260708";

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
    imageSrc: "/assets/guide_step1.webp",
    imageAlt: "アカウント登録の説明図",
    imageWidth: 360,
    imageHeight: 360,
    cardBackgroundColor: "#768A20",
  },
  {
    step: 2,
    title: "サブスク登録・変更",
    description: "契約しているサブスクを登録・変更します。",
    imageSrc: "/assets/guide_step2.webp",
    imageAlt: "サブスク登録・変更の説明図",
    imageWidth: 360,
    imageHeight: 360,
    cardBackgroundColor: "#208A73",
  },
  {
    step: 3,
    title: "お知らせメール設定",
    description: "登録時にお知らせメールを設定する便利！",
    imageSrc: "/assets/guide_step3.webp",
    imageAlt: "お知らせメール設定の説明図",
    imageWidth: 360,
    imageHeight: 360,
    cardBackgroundColor: "#C9981D",
  },
  {
    step: 4,
    title: "サブスク一覧で確認",
    description: "登録が完了したら、一覧から確認してみよう！",
    imageSrc: "/assets/guide_step4.webp",
    imageAlt: "サブスク一覧確認の説明図",
    imageWidth: 360,
    imageHeight: 360,
    cardBackgroundColor: "#8A2082",
  },
];
