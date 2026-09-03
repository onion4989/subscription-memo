# 静的アセット命名（subscription-memo）

共通ルールの正本: `_knowledge/10-standards/asset-naming.md`  
形式: `[種類]_[場所]_[詳細]_[連番|状態].[拡張子]`（小文字・半角英数字）

自前配置の対象は `public/assets/`。新規追加はこの表に従う。既存は **触った箇所だけ**リネーム（一括禁止）。

## 案件の `[場所]`

| 略称 | 意味 | 用途 |
|---|---|---|
| `c` | Common | 全ページ共通（アバター等） |
| `top` | Top / Landing | トップ（ヒーロー等） |
| `sub` | Subscription | サブスク一覧・登録 UI |
| `guide` | Guide | 使い方ページ |
| `account` | Account | アカウント画面（将来用） |

フォルダ目安:

```
public/assets/
  common/           … 場所 c
  pages/
    top/
    sub/
    guide/
    account/        … 必要になったら
```

パスに場所があっても、ファイル名の `[場所]` は残す。

## 旧 → 新 対応表

| 状態 | 旧パス（コード上） | 新パス（予定） |
|---|---|---|
| 未移行（ファイルあり） | `/assets/subscription/view-simple.svg` | `/assets/pages/sub/ic_sub_view-simple.svg` |
| 未移行（ファイルあり） | `/assets/subscription/view-detail.svg` | `/assets/pages/sub/ic_sub_view-detail.svg` |
| 未移行（要実体確認） | `/assets/Hero_Image_comp.png` | `/assets/pages/top/img_top_hero.png` |
| 未移行（要実体確認） | `/assets/guide/Pass_Change_image.webp` | `/assets/pages/guide/img_guide_pass-change.webp` |
| 未移行（要実体確認） | `/assets/guide/Pass_Rest_image.webp` | `/assets/pages/guide/img_guide_pass-reset.webp` |
| 未移行（要実体確認） | `/assets/guide/Mail_setting_image.webp` | `/assets/pages/guide/img_guide_mail-setting.webp` |
| 未移行（要実体確認） | `/assets/guide/MFA_image.webp` | `/assets/pages/guide/img_guide_mfa.webp` |
| 未移行（要実体確認） | `/assets/avater/Avater_images_{1-9}.jpg` | `/assets/common/img_c_avatar_{01-09}.jpg` |

- 「ファイルあり」: リポジトリの `public/assets/` に存在する（P2-1 候補）
- 「要実体確認」: コード参照はあるが、作業ツリーに無い場合はファイル取得後にリネームする
- 移行したら「状態」を `移行済み` に更新し、参照コード・テストを同時更新する

## 参照コード（移行時に更新）

| 旧パス種別 | 主な参照 |
|---|---|
| subscription view icons | `src/components/features/subscription/SubscriptionViewModeToggle.tsx` |
| hero | `src/components/features/landing/HeroSection.tsx` |
| guide | `src/components/features/guide/constants.ts` |
| avatar | `src/lib/user/avatar.ts`（テスト: `src/lib/p2-helpers.test.ts`） |
