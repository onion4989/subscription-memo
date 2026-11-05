# SubscMemo（サブスクMEMO）

サブスクリプションの契約情報を一元管理し、更新日の前にメールで通知して解約忘れを防ぐ Web サービスです。

個人開発（企画・設計・実装・インフラ・テストまで単独）です。

![Build](https://github.com/onion4989/subscription-memo/actions/workflows/deploy.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)



## デモ

https://subscmemo.see-u-soon.design

登録不要（下記アカウントでログイン）ですぐにお試しいただけます。データは毎日リセットされます。自分でアカウント登録して試すことも可能です。

Email：`demo@example.com`  
Password：`demo1234`

デモアカウントでは、二段階認証の設定・アカウント削除・メール／パスワード変更はできません。

<table>
  <tr>
    <td width="70%" valign="top">
      <img src="docs/screenshots/desctop_all_subs_screanshot.png" alt="デスクトップ" />
    </td>
    <td width="30%" valign="top">
      <img src="docs/screenshots/mobile_all_sbsc_screanshot.png" alt="モバイル" />
    </td>
  </tr>
</table>



## 課題と解決

**課題**  
サブスクは「契約を忘れたまま課金され続ける」ことが起きやすく、契約先が増えるほど更新日も金額も把握しづらくなります。

**解決**  
次の 2 点に絞っています。

- **固定費の可視化** — 月額・年額の自動換算と、契約数／合計金額の集計
- **解約忘れの防止** — 更新日の 3 / 5 / 7 日前にメールで通知



## 主な機能

**サブスク管理**  
料金・支払い周期・契約日を登録し、次回更新日を自動計算します（月末の繰り上がりに対応）。月額 ⇄ 年額を自動換算し、契約数と合計金額を集計します。

**更新リマインダー**  
日次バッチが対象を抽出し、同日に複数あればユーザーごとに 1 通へまとめて送信します。送信済みを記録して重複を防ぎ、失敗時は翌日に再送します。

**認証**  
メール + パスワード、および Google / GitHub の OAuth に対応しています。確認メールを経ないとログインできません。同一メールでも、別プロバイダへの自動リンクは禁止しています。

**二段階認証（MFA）**  
認証アプリの TOTP に加え、バックアップコード 10 件を発行します（ハッシュ保存・1 回で失効）。連続失敗時は一時ロックします。

**アカウント管理**  
プロフィール、パスワード変更、通知設定、確認ダイアログとメール通知を伴う退会に対応しています。



## 技術スタック

【フレームワーク】Next.js 16（App Router）  
【理由】Server Components でデータ取得をサーバーに寄せるため

【言語】TypeScript 6（strict）  
【理由】`any` を禁止し、全レイヤーで型を一貫させるため

【UI】React 19 / Tailwind CSS 4 / shadcn/ui  
【理由】UI をソースごと取り込み、自前で調整するため

【DB / ORM】PostgreSQL / Prisma 7  
【理由】制約とトランザクションで整合性を担保するため

【認証】Auth.js v5（JWT）  
【理由】Credentials と OAuth を同一基盤で扱うため

【検証】Zod / React Hook Form  
【理由】同一スキーマをクライアント・サーバーで共用するため

【テスト】Vitest / Playwright  
【理由】ロジックは単体、動線は E2E と使い分けるため

【インフラ】VPS + Dokploy / Docker / GitHub Actions  
【理由】本番相当の構成を自分で構築・自動化するため



## 設計上の工夫

**Server Action を公開エンドポイントとして扱う**  
直接呼び出せる前提で、すべての Action 内でセッション検証と本人確認を行います。ルート保護は画面遷移の入口としてのみ位置づけています。

**単一の情報源を持つ**  
パス定義を `src/lib/routes.ts` に、更新日計算を `renewal-date.ts` に集約しています。フォームのプレビューと保存値、画面遷移と保護対象がずれない構造にするためです。

**副作用の設計方針を明文化**  
`useEffect` を使う条件をルール化し、それ以外は描画時の計算・イベントハンドラ・Server Component へ寄せています。

**レイアウトを画面幅で分離**  
デスクトップは表、モバイルはカードと DOM 自体を切り替え、横スクロールや文字切れを避けています。

**セキュリティ**  
パスワードとバックアップコードは bcrypt でハッシュ化します。リセット系にはレートリミットとアカウント列挙対策を適用し、Cron エンドポイントは Bearer トークンで保護しています。



## テスト

**Vitest**  
約 36 ファイル / 170 ケース。日付計算、金額換算、バリデーション、Server Action などを検証しています。

**Playwright**  
約 10 スペック / 38 ケース。認証、ルート保護、CRUD、MFA、メール確認、デモアカウントの実動線を検証しています。

E2E では、MFA のバックアップコードログインや、IMAP で実際に届いたメールから確認リンクを取得する登録フローまで含めています。

詳細は以下の実施記録を参照してください。
 [Vitest](docs/vitest-results.md)
 [Playwright](docs/playwright-results.md)



## インフラ

`main` への push で GitHub Actions が Docker イメージをビルドし、GHCR 経由で VPS（Ubuntu / Dokploy）へ自動デプロイします。

SSL は Let's Encrypt で自動更新します。更新リマインダーとデモアカウントの初期化は、Cron から日次で実行しています。



## ドキュメント

- [認証の設計](docs/authentication.md) — テーブル構成、ログインパターン、ルート保護、エラー設計
- [開発ガイド](docs/development.md) — セットアップ、環境変数、ディレクトリ構成、デプロイ
- [Vitest 結果](docs/vitest-results.md) — 単体テストの実施記録
- [Playwright 結果](docs/playwright-results.md) — E2E テストの実施記録



## 今後の予定

- SMS 通知の有効化（DB・バリデーションは実装済み、送信プロバイダ未決）
- MFA バックアップコードの残数表示・再発行（現状は解除 → 再設定でのみ再発行可能）



## 作者

名前：Takashi Ogawa  
開発期間：約 1 ヵ月  
ポートフォリオ：https://portfolio.see-u-soon.design/
