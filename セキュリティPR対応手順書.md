# セキュリティ関連PR対応手順書

## 概要

Dependabotによって作成されたセキュリティ関連の依存関係更新PRの分析結果と対応手順を記載します。

### 🟡 慎重検討が必要（中リスク）

以下のPRは破壊的変更やメジャーバージョンアップを含むため、テストが必要です：

| PR番号 | タイトル                                                   | 対象パッケージ  | 更新内容                 | リスク評価 | 注意点                            |
| ------ | ---------------------------------------------------------- | --------------- | ------------------------ | ---------- | --------------------------------- |
| #15    | ⬆️(deps): Bump @solidjs/router from 0.10.10 to 0.15.3      | SolidJS Router  | メジャーバージョンアップ | 中         | APIの破壊的変更の可能性           |
| #14    | ⬆️(deps-dev): Bump vitest from 1.6.1 to 3.2.4              | Vitest          | メジャーバージョンアップ | 中         | テスト環境への影響                |
| #13    | ⬆️(deps-dev): Bump @vitest/coverage-v8 from 2.1.9 to 3.2.4 | Vitest Coverage | メジャーバージョンアップ | 中         | テストカバレッジ計算への影響      |
| #1     | ⬆️(deps-dev): Bump jsdom from 23.2.0 to 27.0.0             | jsdom           | メジャーバージョンアップ | 中         | Node.js v20必須、Breaking Changes |

### 🔴 要詳細検証（高リスク）

以下のPRは大きな変更を含むため、十分な検証が必要です：

| PR番号 | タイトル                                                             | 対象パッケージ | 更新内容                 | リスク評価 | 注意点                                    |
| ------ | -------------------------------------------------------------------- | -------------- | ------------------------ | ---------- | ----------------------------------------- |
| #17    | ⬆️(deps-dev): Bump tailwindcss from 3.4.17 to 4.1.13                 | TailwindCSS    | メジャーバージョンアップ | 高         | CSS出力形式の大幅変更、設定ファイル互換性 |
| #19    | ⬆️(deps-dev): Bump @storybook/blocks from 7.6.20 to 8.6.14           | Storybook      | メジャーバージョンアップ | 高         | Storybookの設定・API変更                  |
| #16    | ⬆️(deps-dev): Bump @storybook/addon-links from 7.6.20 to 9.1.6       | Storybook      | メジャーバージョンアップ | 高         | Storybookアドオンの互換性                 |
| #11    | ⬆️(deps-dev): Bump @storybook/addon-essentials from 7.6.20 to 8.6.14 | Storybook      | メジャーバージョンアップ | 高         | Storybookコア機能への影響                 |

## 対応手順

### Phase 1: 低リスクPRの即座マージ

#### 1. GitHub Actions関連PR（#18, #12, #2）

```bash
# CI環境の更新のため、基本的にマージ可能
gh pr merge 18 --squash --delete-branch
gh pr merge 12 --squash --delete-branch
gh pr merge 2 --squash --delete-branch
```

**確認ポイント：**

- CI が正常に動作すること
- デプロイが成功すること

### Phase 2: 中リスクPRの検証とマージ

#### 1. SolidJS Router (#15)

```bash
# ローカルでブランチをチェックアウト
gh pr checkout 15

# 依存関係インストール
pnpm install

# 型チェック
pnpm type-check

# ビルドテスト
pnpm build

# 開発サーバー起動
pnpm dev
```

**検証項目：**

- ルーティング機能が正常に動作すること
- ページ遷移が正常に行われること
- 型エラーが発生していないこと

#### 2. Vitest関連 (#14, #13)

```bash
# テスト実行
pnpm test

# カバレッジ確認
pnpm test --coverage

# 各パッケージ個別テスト
pnpm --filter @band-setlist/shared test
pnpm --filter @band-setlist/supabase-client test
```

**検証項目：**

- 既存テストが全て通ること
- カバレッジレポートが正しく生成されること

#### 3. jsdom (#1)

```bash
# Node.jsバージョン確認（v20以上必要）
node --version

# テスト実行（主にDOM関連）
pnpm test
```

**検証項目：**

- DOM操作を含むテストが正常に動作すること
- Breaking Changesの影響がないこと

### Phase 3: 高リスクPRの段階的検証

#### 1. TailwindCSS v4 (#17)

⚠️ **重要**: TailwindCSS v4は大幅な変更を含むため、慎重な検証が必要

```bash
# 設定ファイル更新が必要な可能性
# tailwind.config.js の確認
cat tailwind.config.js

# CSS生成確認
pnpm build

# 開発サーバーでUI確認
pnpm dev
```

**検証項目：**

- 全ページのスタイリングが正しく適用されること
- CSS出力サイズに大きな変化がないこと
- 設定ファイルの互換性
- パフォーマンスへの影響

#### 2. Storybook関連 (#19, #16, #11)

```bash
# Storybookビルド確認
pnpm --filter @band-setlist/ui build-storybook

# Storybook起動
pnpm --filter @band-setlist/ui storybook
```

**検証項目：**

- Storybookが正常に起動すること
- 全コンポーネントが正しく表示されること
- アドオン機能が正常に動作すること

## マージ順序の推奨事項

1. **GitHub Actions関連** (#18, #12, #2) → 即座実行可能
2. **テスト関連** (#14, #13, #1) → アプリケーション機能への影響が少ない
3. **SolidJS Router** (#15) → コア機能に影響するが、比較的安全
4. **TailwindCSS** (#17) → UIに大きく影響するため慎重に
5. **Storybook関連** (#19, #16, #11) → 開発環境のみの影響

## トラブルシューティング

### CI/CD失敗時の対応

```bash
# ログ確認
gh run list
gh run view [run-id]

# ローカルでの問題再現
pnpm lint
pnpm type-check
pnpm build
pnpm test
```

### 依存関係競合時の対応

```bash
# 依存関係ツリー確認
pnpm why [package-name]

# キャッシュクリア
pnpm store prune

# 完全再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### ロールバック手順

```bash
# PRを閉じる
gh pr close [pr-number]

# 依存関係を元に戻す
git checkout main
pnpm install
```

## 注意事項

1. **本番環境への影響を最小化**するため、まず開発環境で十分検証する
2. **破壊的変更**を含むPRは必ずローカルでテストを実行する
3. **CI/CDパイプライン**が全て緑になることを確認してからマージする
4. **ユーザー向け機能**に影響する可能性がある場合は、段階的リリースを検討する
5. **依存関係の競合**が発生した場合は、一度に複数のPRをマージしない

## 完了チェックリスト

### 低リスクPR

- [ ] #18 actions/setup-node
- [ ] #12 actions/github-script
- [ ] #2 actions/checkout

### 中リスクPR

- [ ] #15 @solidjs/router（ルーティング動作確認）
- [ ] #14 vitest（テスト実行確認）
- [ ] #13 @vitest/coverage-v8（カバレッジ確認）
- [ ] #1 jsdom（DOM操作テスト確認）

### 高リスクPR（要慎重検証）

- [ ] #17 tailwindcss（全UI確認）
- [ ] #19 @storybook/blocks（Storybook確認）
- [ ] #16 @storybook/addon-links（アドオン確認）
- [ ] #11 @storybook/addon-essentials（コア機能確認）

---

**作成日**: 2025-09-16
**最終更新**: 2025-09-16
**担当者**: セキュリティ対応チーム
