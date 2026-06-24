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
| `/records` | 記録一覧(種目・期間フィルタ、ページネーション、編集・削除) |
| `/records/new` | 記録入力フォーム |
| `/stats` | レーティング推移グラフ(01Game/Cricket別) |

## ディレクトリ構成

```
darts-tracker-web/
├── app/
│   ├── api/              # BFF(Backend For Frontend) Route Handlers。
│   │                      # ブラウザはこことだけ通信し、ここがGoバックエンドへサーバー間通信で中継する
│   └── ...                # ページ(App Router)
├── lib/
│   ├── server/           # サーバー専用(Goバックエンド中継、Cookie読み書き)
│   └── ...                # APIクライアント、ログイン済みフラグ管理、SWR fetcher
├── components/          # フォーム・テーブル・グラフコンポーネント
├── types/                # バックエンドAPIのレスポンス型
```

### 認証アーキテクチャ(BFFパターン)

```
ブラウザ ──(同一オリジン、httpOnly Cookie自動送信)──> app/api/* (Route Handlers)
                                                              │
                                                              │ サーバー間通信(Authorizationヘッダー)
                                                              ▼
                                                      darts-tracker-api(Go)
```

アクセストークン・リフレッシュトークンはNext.jsのサーバー側だけが扱うhttpOnly Cookieで管理し、ブラウザのJavaScriptからは一切アクセスできない。これによりXSSが万一発生してもトークンを窃取されない。フロント(Vercel)とバック(Render)は別ドメインだが、ブラウザが直接Goバックエンドと通信することはないため、クロスサイトCookieの問題(SameSite=None必須化、Safariのトラッキング防止等)を回避している。

## セットアップ

```bash
cp .env.local.example .env.local
# .env.local に API_BASE_URL(darts-tracker-apiのURL)を設定
npm install
npm run dev
```
