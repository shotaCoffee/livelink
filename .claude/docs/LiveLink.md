# バンド向けセットリスト共有アプリ開発ガイド（モノレポ版）

## 📋 プロジェクト概要

### アプリの目的

- **メイン**: ライブ参加見込みのお客さんに「今度こんな曲やります！」を効果的にシェア
- **サブ**: メンバー間での楽曲管理・履歴共有

### 技術スタック（無料構成）

- **Frontend**: SolidJS + Vite + TypeScript + Tailwind CSS
- **Backend**: Supabase（PostgreSQL + Auth + Edge Functions）
- **Monorepo**: pnpm workspaces
- **Development**: Docker Compose
- **Production**: Vercel（Frontend） + Supabase（Backend）

## 🗂 モノレポ構造

```
liveLink/
├── package.json                    # ルートpackage.json（workspace設定）
├── pnpm-workspace.yaml            # pnpm workspace設定
├── docker-compose.yml
├── .env.example
├── README.md
├── apps/
│   └── web/                       # フロントエンドアプリ
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── index.html
│       └── src/
│           ├── components/
│           ├── pages/
│           ├── stores/
│           └── lib/
├── packages/
│   ├── shared/                    # 共有型定義・ユーティリティ
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── database.ts
│   │   │   │   └── index.ts
│   │   │   └── utils/
│   │   │       └── index.ts
│   │   └── tsconfig.json
│   ├── ui/                        # 共有UIコンポーネント（将来拡張用）
│   │   ├── package.json
│   │   ├── src/
│   │   │   └── components/
│   │   └── tsconfig.json
│   └── supabase-client/          # Supabase関連ロジック
│       ├── package.json
│       ├── src/
│       │   ├── client.ts
│       │   ├── auth.ts
│       │   └── queries/
│       │       ├── songs.ts
│       │       ├── lives.ts
│       │       └── setlists.ts
│       └── tsconfig.json
└── supabase/                     # Supabaseプロジェクト
    ├── config.toml
    ├── migrations/
    │   └── 20241212000001_initial_schema.sql
    └── functions/
        └── generate-share-link/
            └── index.ts
```

## 🚀 セットアップ手順

### 1. モノレポ初期化

```bash
# プロジェクトディレクトリ作成
mkdir liveLink
cd liveLink

# pnpmインストール（未インストールの場合）
npm install -g pnpm

# ルートpackage.json作成
pnpm init

# workspace設定
touch pnpm-workspace.yaml
```

**package.json**（ルート）:

```json
{
  "name": "liveLink",
  "version": "1.0.0",
  "private": true,
  "description": "バンド向けセットリスト共有アプリ",
  "scripts": {
    "dev": "pnpm --parallel --recursive run dev",
    "build": "pnpm --recursive run build",
    "lint": "pnpm --recursive run lint",
    "type-check": "pnpm --recursive run type-check",
    "clean": "pnpm --recursive run clean"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^18.0.0"
  }
}
```

**pnpm-workspace.yaml**:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 2. 共有パッケージセットアップ

```bash
# 共有パッケージディレクトリ作成
mkdir -p packages/shared/src/types
mkdir -p packages/shared/src/utils
mkdir -p packages/supabase-client/src/queries
mkdir -p packages/ui/src/components
```

**packages/shared/package.json**:

```json
{
  "name": "@band-setlist/shared",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types/index.ts",
    "./utils": "./src/utils/index.ts"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

**packages/supabase-client/package.json**:

```json
{
  "name": "@band-setlist/supabase-client",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "@band-setlist/shared": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### 3. フロントエンドアプリセットアップ

```bash
# アプリディレクトリ作成
mkdir -p apps/web
cd apps/web

# SolidJS プロジェクト作成
npm create solid@latest . --typescript

# 依存関係調整（モノレポ用）
cd ../..
```

**apps/web/package.json**（実装済み）:

```json
{
  "name": "@livelink/web",
  "version": "1.0.0",
  "description": "LiveLink main web application",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix"
  },
  "dependencies": {
    "@band-setlist/shared": "workspace:*",
    "@band-setlist/supabase-client": "workspace:*",
    "@band-setlist/ui": "workspace:*",
    "@solidjs/router": "^0.10.5",
    "solid-js": "^1.8.11"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.10",
    "vite-plugin-solid": "^2.8.2"
  }
}
```

### 4. 共有型定義実装（✅ 実装完了）

**packages/shared/src/types/database.ts**（実装済み）:

```typescript
export interface Song {
  id: string
  band_id: string
  title: string
  artist: string
  youtube_url?: string
  spotify_url?: string
  created_at: string
  updated_at: string
}

export interface Live {
  id: string
  band_id: string
  name: string
  date: string
  venue: string
  ticket_url?: string
  is_upcoming: boolean
  share_slug?: string
  created_at: string
  updated_at: string
}

export interface Band {
  id: string
  user_id: string
  name: string
  description?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface SetlistItem {
  id: string
  live_id: string
  song_id: string
  order_index: number
  created_at: string
  songs?: Song
}

export interface LiveWithSetlist extends Live {
  setlists: SetlistItem[]
  bands?: Band
}

// API Response types
export type ApiResponse<T> = {
  data: T | null
  error: string | null
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
}
```

**packages/shared/src/types/index.ts**:

```typescript
export * from './database'

// Form types
export interface SongFormData {
  title: string
  artist: string
  youtube_url?: string
  spotify_url?: string
}

export interface LiveFormData {
  name: string
  date: string
  venue: string
  ticket_url?: string
  is_upcoming?: boolean
}

// UI State types
export interface LoadingState {
  isLoading: boolean
  error?: string
}

export interface PaginationState {
  page: number
  limit: number
  total: number
}
```

**packages/shared/src/index.ts**:

```typescript
export * from './types'
export * from './utils'
```

### 5. Supabaseクライアント実装（✅ 実装完了）

**packages/supabase-client/src/client.ts**（実装済み）:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**packages/supabase-client/src/auth.ts**:

```typescript
import { supabase } from './client'

export const auth = {
  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),

  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),

  getUser: () => supabase.auth.getUser(),

  onAuthStateChange: (callback: (event: string, session: any) => void) =>
    supabase.auth.onAuthStateChange(callback),
}
```

**packages/supabase-client/src/queries/songs.ts**:

```typescript
import { supabase } from '../client'
import type { Song, SongFormData, ApiResponse } from '@band-setlist/shared'

export const songQueries = {
  // 楽曲一覧取得
  async getAll(bandId: string): Promise<ApiResponse<Song[]>> {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('band_id', bandId)
      .order('created_at', { ascending: false })

    return { data, error: error?.message || null }
  },

  // 楽曲作成
  async create(
    bandId: string,
    songData: SongFormData
  ): Promise<ApiResponse<Song>> {
    const { data, error } = await supabase
      .from('songs')
      .insert({
        band_id: bandId,
        ...songData,
      })
      .select()
      .single()

    return { data, error: error?.message || null }
  },

  // 楽曲更新
  async update(
    id: string,
    updates: Partial<SongFormData>
  ): Promise<ApiResponse<Song>> {
    const { data, error } = await supabase
      .from('songs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    return { data, error: error?.message || null }
  },

  // 楽曲削除
  async delete(id: string): Promise<ApiResponse<null>> {
    const { error } = await supabase.from('songs').delete().eq('id', id)

    return { data: null, error: error?.message || null }
  },

  // 楽曲検索
  async search(bandId: string, query: string): Promise<ApiResponse<Song[]>> {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('band_id', bandId)
      .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    return { data, error: error?.message || null }
  },
}
```

**packages/supabase-client/src/index.ts**:

```typescript
export * from './client'
export * from './auth'
export * from './queries/songs'
export * from './queries/lives'
export * from './queries/setlists'
```

### 6. Docker設定（✅ 実装完了）

**docker-compose.yml**（ルートに配置、実装済み）:

```yaml
version: '3.8'

services:
  web:
    build:
      context: ../..
      dockerfile: ../../apps/web/Dockerfile
    ports:
      - '3000:3000'
    volumes:
      - .:/app
      - /app/node_modules
      - /app/apps/web/node_modules
    environment:
      - VITE_SUPABASE_URL=http://localhost:54321
      - VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    working_dir: /app
    command: sh -c "pnpm install && pnpm --filter @band-setlist/web dev"
    depends_on:
      - supabase

  supabase:
    image: supabase/cli:latest
    command: supabase start --workdir /app/supabase
    volumes:
      - ./supabase:/app/supabase
    ports:
      - '54321:54321' # API
      - '54323:54323' # Dashboard
```

**apps/web/Dockerfile**:

```dockerfile
FROM node:18-alpine

# pnpmインストール
RUN npm install -g pnpm

WORKDIR /app

# 依存関係ファイルをコピー
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/*/package.json ./packages/*/
COPY apps/*/package.json ./apps/*/

# 依存関係インストール
RUN pnpm install --frozen-lockfile

# ソースコードをコピー
COPY . .

EXPOSE 3000

# 開発サーバー起動
CMD ["pnpm", "--filter", "@band-setlist/web", "dev", "--host", "0.0.0.0"]
```

## 🔧 モノレポ開発コマンド（✅ 環境構築完了）

### 初回セットアップ（✅ 完了済み）

```bash
# 全ての依存関係をインストール
pnpm install

# Supabase CLI インストール
npm install -g supabase

# Supabaseプロジェクト初期化
supabase init

# Supabaseローカル環境起動
supabase start

# マイグレーション実行
supabase db reset

# 開発サーバー起動
pnpm dev
# または
docker-compose up
```

### 日常の開発コマンド（現在利用可能）

```bash
# 全てのアプリの開発サーバー起動
pnpm dev

# 特定のアプリのみ起動（現在動作中）
pnpm --filter @livelink/web dev  # http://localhost:3000

# 全てのパッケージをビルド（動作確認済み）
pnpm build

# 特定のパッケージをビルド
pnpm --filter @band-setlist/shared build
pnpm --filter @band-setlist/supabase-client build
pnpm --filter @band-setlist/ui build

# 型チェック（全体、動作確認済み）
pnpm type-check

# テスト実行（動作確認済み）
pnpm --filter @band-setlist/shared test --run      # 27テスト通過
pnpm --filter @band-setlist/supabase-client test --run  # 41テスト通過

# 新しい依存関係追加（webアプリに）
pnpm --filter @livelink/web add @some/package

# 新しいdevDependency追加（ルートに）
pnpm add -D -w @some/dev-package

# パッケージ間の依存関係確認
pnpm list --depth=0

# ワークスペース情報確認
pnpm -r list --depth=0
```

### パッケージ間の連携

```bash
# sharedパッケージの変更をwebアプリで即座に反映
# （pnpm workspaceが自動的にシンボリックリンクで解決）

# 型定義を更新したら
cd packages/shared
# 変更を保存するだけで、apps/webで即座に利用可能

# supabase-clientの変更も同様
cd packages/supabase-client
# 変更保存で即座に反映
```

## 📱 モノレポでの開発フロー

### 1. 共有型定義の更新

```bash
# packages/shared で型定義を追加・修正
cd packages/shared/src/types
# database.ts を編集

# すべてのアプリで即座に新しい型が利用可能
```

### 2. Supabaseクエリの実装

```bash
# packages/supabase-client で新しいクエリを追加
cd packages/supabase-client/src/queries
# lives.ts, setlists.ts を実装

# apps/web から import して利用
```

### 3. UIコンポーネントの共有

```bash
# packages/ui で再利用可能なコンポーネント作成
# 将来的にモバイルアプリやダッシュボードを追加する時に便利
```

## ✅ モノレポの利点

1. **型安全性**: 共有型定義で一貫性確保
2. **コード再利用**: クエリロジックの共有
3. **開発効率**: 一つのリポジトリで全て管理
4. **依存関係管理**: pnpmによる効率的なパッケージ管理
5. **将来の拡張性**: モバイルアプリ、管理画面追加が容易

## 🎯 実装進捗状況（2025年9月13日現在）

### ✅ 完了済み（Phase 1 & 2基本構造）

**Phase 1: 共有パッケージ基盤（100%完了）**

- [x] `packages/shared` の型定義完成（27テスト全通過）
- [x] `packages/supabase-client` のクエリ関数実装（41テスト全通過）
- [x] `packages/ui` のUIコンポーネント実装（15コンポーネント完成）

**Phase 2: SolidJSアプリケーション基本構造（Phase 2.1-2.3完了）**

- [x] モノレポセットアップ完了
- [x] `pnpm install` で全依存関係インストール完了
- [x] `pnpm dev` でwebアプリ起動確認完了（http://localhost:3000）
- [x] 各パッケージ間の import/export 動作確認完了
- [x] apps/web から共有パッケージ利用確認完了
- [x] apps/web で認証機能実装完了
- [x] レイアウト・ナビゲーション作成完了
- [x] 基本ページ構造実装完了（Home, Songs, Lives, Settings）

### 🔄 実装中（Phase 2.4）

**主要機能の詳細実装（次のフェーズ）**

- [ ] 楽曲管理機能の完全実装（CRUD操作詳細）
- [ ] ライブ管理機能の完全実装
- [ ] セットリスト管理機能の実装
- [ ] 公開ページ（セットリスト共有）の実装

### ⏳ 未実装（Phase 3以降）

**Phase 3: Supabaseバックエンド設定**

- [ ] supabase/ディレクトリ作成
- [ ] データベーススキーマ実装
- [ ] マイグレーションファイル作成

**Phase 4: 本番環境・デプロイ**

- [ ] Vercel デプロイ設定
- [ ] Supabase 本番プロジェクト設定

## 🚀 この構成のメリット

- **スケーラビリティ**: 将来的にモバイルアプリ、管理画面、APIサーバーを追加しやすい
- **型安全性**: TypeScriptの恩恵を最大限活用
- **開発効率**: ホットリロードでの高速開発
- **保守性**: コードの重複を避けて一元管理

モノレポ構成の方が本格的で、将来的な拡張も考慮した構造になっています！
