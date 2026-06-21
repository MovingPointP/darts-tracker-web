# darts-tracker-web

Next.js + TypeScript で構築するダーツ得点記録アプリのフロントエンド。

バックエンド([darts-tracker-api](https://github.com/MovingPointP/darts-tracker-api))のREST APIを介して、01Game・クリケット・COUNTUPの3種目の記録登録/編集/削除、およびレーティング推移の可視化を行う。

設計の経緯・詳細は [darts-tracker-api](https://github.com/MovingPointP/darts-tracker-api) リポジトリの `docs/design.md` を参照(フロント・バックエンド共通の設計ドキュメントとして、バックエンド側に一本化している)。

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | [Next.js](https://nextjs.org/) (App Router) |
| 言語 | TypeScript |
| UIライブラリ | [Mantine](https://mantine.dev/) (`@mantine/core` / `@mantine/form` / `@mantine/charts` / `@mantine/hooks`) |
| バリデーション | [zod](https://zod.dev/) |
| データ取得 | [SWR](https://swr.vercel.app/) |
| デプロイ | [Vercel](https://vercel.com/) |

## 画面構成

| パス | 内容 |
|---|---|
| `/login` `/signup` | ログイン・サインアップ |
| `/records` | 記録一覧(種目フィルタ、編集・削除) |
| `/records/new` | 記録入力フォーム |
| `/stats` | レーティング推移グラフ(01Game/Cricket別) |

## ディレクトリ構成

```
darts-tracker-web/
├── app/                 # ページ(App Router)
├── lib/                 # APIクライアント、認証トークン管理、SWR fetcher
├── components/          # フォーム・テーブル・グラフコンポーネント
├── types/                # バックエンドAPIのレスポンス型
```

## セットアップ

```bash
cp .env.local.example .env.local
# .env.local に NEXT_PUBLIC_API_BASE_URL(darts-tracker-apiのURL)を設定
npm install
npm run dev
```
