# 本番環境メール認証設定ガイド

## 📧 Issue #5: メール認証URL修正手順

### 🎯 対象

- **本番ドメイン**: `https://livelink-web.vercel.app`
- **問題**: メール認証リンクが`localhost:3000`を指している

---

## ✅ 自動化された修正（完了済み）

### 1. config.toml更新

```toml
[auth]
site_url = "https://livelink-web.vercel.app"
additional_redirect_urls = ["https://livelink-web.vercel.app", "http://127.0.0.1:3000"]
```

**変更内容**:

- `site_url`: 本番ドメインに変更
- `additional_redirect_urls`: 本番ドメインを追加（ローカル開発用も維持）

---

## 🛠️ 手動設定が必要な作業

### 1. Supabaseプロジェクトリンク確認

```bash
# プロジェクトがリンクされているか確認
npx supabase status

# リンクされていない場合
npx supabase login
npx supabase link --project-ref [your-project-ref]
```

### 2. 本番環境への設定適用

```bash
# config.tomlの変更を本番に適用
npx supabase db push --include-all
```

**⚠️ 重要**: 上記コマンドは設定の一部のみ適用します。完全な修正には以下の手動設定が必要です。

### 3. Supabaseダッシュボードでの手動設定

**🌐 アクセス**: [Supabase Dashboard](https://supabase.com/dashboard)

#### Step 1: Authentication設定画面にアクセス

```
プロジェクト選択 > Authentication > Settings > URL Configuration
```

#### Step 2: Site URL設定

```
Site URL: https://livelink-web.vercel.app
```

#### Step 3: Redirect URLs設定

```
Redirect URLs に以下を追加:
- https://livelink-web.vercel.app
- https://livelink-web.vercel.app/**
- https://livelink-web.vercel.app/auth/callback
```

#### Step 4: 設定保存

```
"Save" ボタンをクリック
```

---

## 🧪 動作確認手順

### 1. メール認証テスト

```bash
# 新規ユーザー登録でメール送信
curl -X POST https://[your-project-ref].supabase.co/auth/v1/signup \
  -H "apikey: [your-anon-key]" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 2. 受信メール確認

- メール内のリンクが `https://livelink-web.vercel.app` を含むことを確認
- `localhost:3000` が含まれていないことを確認

### 3. ログイン機能確認

```bash
# Web アプリでの実際のログインテスト
# https://livelink-web.vercel.app にアクセス
# 新規登録 → メール確認 → ログイン の流れをテスト
```

---

## 📋 完了チェックリスト

- [x] `supabase/config.toml` を本番ドメインに更新
- [ ] Supabase CLI でプロジェクトリンク確認
- [ ] Supabaseダッシュボードで手動設定
  - [ ] Site URL設定
  - [ ] Redirect URLs設定
  - [ ] 設定保存
- [ ] メール認証動作確認
- [ ] 本番環境でのログイン動作確認

---

## 🚨 トラブルシューティング

### エラー: "Invalid login credentials"

**原因**: Redirect URLsの設定不足
**解決**: ダッシュボードで全必要URLを追加

### エラー: "Redirect URL not allowed"

**原因**: 正確なURLマッチング必要
**解決**: `/**` ワイルドカード追加

### メールが送信されない

**原因**: SMTP設定またはドメイン認証問題
**解決**: Supabaseサポート or SMTP設定確認

---

## 📞 サポート情報

- **Issue**: #5 - https://github.com/shotaCoffee/livelink/issues/5
- **設定ファイル**: `supabase/config.toml:120-122`
- **ドキュメント**: `.claude/docs/SUPABASE_SETUP.md`
