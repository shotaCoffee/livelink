# liveLink - バンド向けセットリスト共有アプリ

![liveLink Logo](https://via.placeholder.com/150x50?text=liveLink)

## プロジェクト概要

liveLinkは、バンド活動を行うミュージシャンのためのセットリスト管理・共有アプリケーションです。曲のレパートリー管理からライブイベントのセットリスト作成、そして観客とのセットリスト共有まで、バンド活動に必要な機能を提供します。

## 主な機能

- 👥 **バンド管理**: バンド情報の登録・編集
- 🎵 **曲管理**: レパートリー曲の登録・管理（YouTube/Spotifyリンク対応）
- 🎭 **ライブイベント管理**: 開催予定・過去のライブイベント管理
- 📋 **セットリスト作成**: ドラッグ&ドロップでのセットリスト組み立て
- 🔗 **セットリスト共有**: 一意のURLで観客とセットリストを共有

## 技術スタック

### フロントエンド

- **Solid.js**: 高速なレンダリングとリアクティブな状態管理
- **TypeScript**: 型安全なコード開発
- **Tailwind CSS**: 効率的なUIスタイリング
- **Vite**: 高速な開発環境とビルドツール

### バックエンド

- **Supabase**: バックエンドサービス（認証、データベース、ストレージ）
- **PostgreSQL**: リレーショナルデータベース
- **Edge Functions**: サーバーレスAPIエンドポイント

### 開発ツール

- **pnpm**: 高速なパッケージマネージャー
- **ESLint/Prettier**: コード品質管理
- **Vitest**: テストフレームワーク
- **Docker**: 開発・デプロイメント環境の一貫性確保

## プロジェクト構成

```
liveLink/
├── apps/                  # フロントエンドアプリケーション
│   └── web/               # Webアプリケーション (Solid.js)
├── packages/              # 共有パッケージ
│   ├── shared/            # 共通型定義・ユーティリティ
│   ├── supabase-client/   # Supabase APIクライアント
│   └── ui/                # 共有UIコンポーネント
└── supabase/              # Supabase設定・Edge Functions
    ├── functions/         # サーバーレス関数
    └── migrations/        # データベースマイグレーション
```

## 開発を始める

### 前提条件

- Node.js (v20以上)
- pnpm (v10.15.1以上)
- Docker & Docker Compose (ローカル開発用)

### セットアップ

1. リポジトリをクローン:

   ```bash
   git clone https://github.com/yourusername/liveLink.git
   cd liveLink
   ```

2. 依存関係をインストール:

   ```bash
   pnpm install
   ```

3. 環境変数の設定:
   `.env.example`を`.env`にコピーして必要な環境変数を設定

4. ローカル開発環境の起動:

   ```bash
   # Supabaseローカル環境の起動
   docker-compose up -d

   # 開発サーバーの起動
   pnpm dev
   ```

5. ブラウザで以下のURLにアクセス:
   - フロントエンド: `http://localhost:3000`
   - Supabase Studio: `http://localhost:54323`

## 利用可能なスクリプト

- `pnpm dev`: 開発サーバーを起動
- `pnpm build`: プロダクションビルドを作成
- `pnpm lint`: コードリンティングを実行
- `pnpm type-check`: 型チェックを実行
- `pnpm test`: テストを実行
- `pnpm clean`: ビルドファイルをクリーンアップ

## デプロイ

### Supabase

1. Supabaseプロジェクトを作成
2. マイグレーションを適用:
   ```bash
   pnpm supabase db push
   ```
3. Edge Functionsをデプロイ:
   ```bash
   pnpm supabase functions deploy
   ```

### Webアプリケーション

- Vercel, Netlify, Cloudflareなどのホスティングサービスにデプロイできます
- ビルドコマンド: `pnpm build`
- 出力ディレクトリ: `apps/web/dist`

## ライセンス

ISC © 2025
