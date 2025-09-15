# Supabase Setup Guide

このドキュメントでは、LiveLinkアプリケーションのSupabaseバックエンドをセットアップするための手順を説明します。

## 前提条件

- Supabaseアカウントが作成済みであること
- プロジェクトのGitリポジトリにアクセスできること
- Node.js 18以降がインストールされていること

## セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase Dashboard](https://supabase.com/dashboard)にログイン
2. "New Project"をクリック
3. プロジェクト詳細を入力：
   - **Name**: `livelink-production`
   - **Database Password**: 強力なパスワードを生成・保存
   - **Region**: `Northeast Asia (Tokyo)` を選択（日本向けアプリのため）
4. "Create new project"をクリック
5. プロジェクトの作成完了を待つ（通常2-3分）

### 2. 環境変数の取得と設定

プロジェクト作成後、以下の情報をメモ：

1. **Project URL**: `https://[your-project-ref].supabase.co`
2. **API Keys**:
   - `anon` key（公開用）
   - `service_role` key（サーバー用・秘匿）

これらの値を以下のファイルに設定：

#### `.env.local` (開発環境用)

```bash
VITE_SUPABASE_URL=https://[your-project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

#### Vercelデプロイ設定（本番環境用）

Vercel Dashboardで以下の環境変数を設定：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3. データベースマイグレーションの実行

ローカル環境でテスト済みのマイグレーションを本番に適用：

```bash
# Supabase CLIで本番プロジェクトにリンク
npx supabase login
npx supabase link --project-ref [your-project-ref]

# マイグレーションを本番に適用
npx supabase db push
```

適用されるマイグレーション：

- `20250913000001_initial_schema.sql` - 基本テーブル構造 + 初期サンプルデータ
  - bands, songs, lives, setlist_itemsテーブル作成
  - RLSポリシー設定
  - テストバンド・楽曲・ライブデータ（arumona-2025 slugを含む）
- `20250913000002_update_lives_schema.sql` - lives.nameをlives.titleに変更
- `20250913000003_disable_rls_for_testing.sql` - テスト用RLS無効化設定

**⚠️ 重要**: マイグレーション実行前にデータベースのバックアップを取ることを推奨

### 4. Edge Functionsのデプロイ

以下のEdge Functionsを本番にデプロイ：

```bash
# 共有スラッグ生成機能
npx supabase functions deploy share-slug-generator

# セットリスト共有API
npx supabase functions deploy setlist-share
```

### 5. Row Level Security (RLS) の確認

以下のポリシーが正しく設定されているか確認：

#### Bandsテーブル

- ユーザーは自分のバンドのみ表示・操作可能

#### Songsテーブル

- ユーザーは自分のバンドの楽曲のみ表示・操作可能

#### Livesテーブル

- ユーザーは自分のバンドのライブのみ表示・操作可能
- `share_slug`が設定されているライブは公開アクセス可能

#### Setlist Itemsテーブル

- ユーザーは自分のバンドのセットリストのみ操作可能
- 公開されているライブのセットリストは閲覧可能

### 6. テストデータの確認

本番環境に最初のテストユーザーとデータを作成：

1. Supabase Dashboardの認証機能でテストユーザー作成
2. 以下のテストデータをSQL Editorで挿入：

```sql
-- テストバンドの作成（user_idは作成したテストユーザーのIDに置き換え）
INSERT INTO bands (user_id, name, description)
VALUES ('[test-user-id]', 'テストバンド', 'サンプルバンドです');

-- テスト楽曲の追加
INSERT INTO songs (band_id, title, artist, youtube_url)
VALUES ('[band-id]', 'テスト楽曲', 'テストアーティスト', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

-- テストライブの作成
INSERT INTO lives (band_id, title, date, venue, share_slug)
VALUES ('[band-id]', 'テストライブ', '2025-01-15', 'テスト会場', 'test123');
```

### 7. フロントエンドの設定確認

フロントエンドアプリケーションが新しいSupabase設定を使用するように確認：

1. **環境変数の確認**

   ```bash
   # .env.localまたはVercel設定で以下が設定されているか
   VITE_SUPABASE_URL=https://[your-project-ref].supabase.co
   VITE_SUPABASE_ANON_KEY=[your-anon-key]
   ```

2. **Supabaseクライアント接続確認**
   - ブラウザのコンソールで「🔧 Supabase Client Config」ログが表示されることを確認
   - URLが正しいプロジェクトを指していることを確認

3. **認証フローの動作確認**
   - ログイン・サインアップが正常に動作するか
   - 認証状態の管理が適切に機能するか

4. **データアクセスの確認**
   - 楽曲・ライブデータの読み書きが正常に動作するか
   - API呼び出しがエラーなく完了するか

5. **公開ページの動作確認**（⭐️ 今日修正完了）
   - `/share/[slug]` URLでの公開セットリストアクセス
   - livesResourceのリアクティブ更新が正常に機能するか
   - セットリストデータの表示確認

### 8. Edge Functionsの動作確認

以下のエンドポイントが正常に動作するか確認：

```bash
# 共有スラッグ生成のテスト
curl -X POST https://[your-project-ref].supabase.co/functions/v1/share-slug-generator \
  -H "Authorization: Bearer [your-anon-key]" \
  -H "Content-Type: application/json" \
  -d '{"checkUniqueness": true}'

# セットリスト共有のテスト
curl -X POST https://[your-project-ref].supabase.co/functions/v1/setlist-share \
  -H "Authorization: Bearer [your-anon-key]" \
  -H "Content-Type: application/json" \
  -d '{"share_slug": "test123"}'
```

## 完了後の確認項目

- [ ] Supabaseプロジェクトが作成されている
- [ ] 環境変数が設定されている
- [ ] データベースマイグレーションが適用されている
- [ ] Edge Functionsがデプロイされている
- [ ] RLSポリシーが正しく設定されている
- [ ] テストデータが作成されている
- [ ] フロントエンドが接続できている
- [ ] Edge Functionsが動作している

## トラブルシューティング

### よくある問題

1. **マイグレーションエラー**
   - プロジェクトが正しくリンクされているか確認
   - データベースパスワードが正しいか確認

2. **認証エラー**
   - API Keyが正しく設定されているか確認
   - 環境変数名が正しいか確認（`VITE_`プレフィックス）

3. **RLSエラー**
   - ユーザーが正しく認証されているか確認
   - ポリシーが正しく設定されているか確認

4. **Edge Function エラー**
   - 関数ログを確認（Supabase Dashboard > Edge Functions > Logs）
   - 環境変数が関数内で利用可能か確認

5. **公開ページが「ページが見つかりません」エラー**（✅ 解決済み）
   - **症状**: `/share/[slug]` にアクセスしても「指定されたセットリストは存在しないか、公開されていません」が表示される
   - **原因**: SolidJSのResourceとonMountのタイミング問題で、livesResourceの変更をリアクティブに監視できていない
   - **解決策**:

     ```typescript
     // ❌ 問題のあるコード（onMountで一度だけ実行）
     onMount(async () => {
       const lives = livesContext.livesResource()
       // livesが undefined の場合、検索処理が実行されない
     })

     // ✅ 修正後のコード（createEffectでリアクティブに監視）
     createEffect(() => {
       const lives = livesContext.livesResource()
       if (lives) {
         // データが利用可能になった時点で自動実行
         const matchedLive = lives.find(live => live.share_slug === slug)
         // ...
       }
     })
     ```

   - **確認方法**: ブラウザコンソールで「Lives resource updated」ログが表示されること

6. **モックデータvs実際のデータの混在問題**（✅ 解決済み）
   - **症状**: 環境変数の設定によってモックデータとAPIデータが適切に切り替わらない
   - **原因**: `isPlaceholder && !isLocalSupabase` の条件分岐ロジック
   - **解決策**: ローカルSupabase使用時は必ず実際のAPIからデータを取得し、テストデータをマイグレーションに含める

### サポート

問題が発生した場合は、以下の情報と共に報告してください：

- エラーメッセージ
- 実行したコマンド
- Supabaseプロジェクトの設定
- ブラウザのコンソールログ
