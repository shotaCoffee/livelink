# フロントエンドデバッグガイド

このドキュメントでは、LiveLinkアプリケーションのフロントエンド開発時によく発生する問題とその解決方法をまとめています。

## 🚨 よく発生する問題と解決方法

### 1. 公開ページの「ページが見つかりません」エラー

#### 症状

- `/share/[slug]` にアクセスしても「指定されたセットリストは存在しないか、公開されていません」が表示される
- ブラウザのコンソールで「SharePage: No lives data available」が表示される
- APIからはデータが正常に取得されている（「API response: {data: Array(2), error: null}」）

#### 根本原因

SolidJSの`createResource`と`onMount`のタイミング問題：

```typescript
// ❌ 問題のあるパターン
onMount(async () => {
  const lives = livesContext.livesResource() // 初回は undefined
  // livesが undefined なので、検索処理が実行されない
  if (lives) {
    // この処理は実行されない
  }
})
```

`livesResource()`は非同期でデータを取得するため、`onMount`の実行時にはまだ`undefined`の状態。

#### 解決方法

`createEffect`を使用してリアクティブにResourceの変更を監視：

```typescript
// ✅ 修正後のパターン
onMount(() => {
  // 初期化処理のみ
  const lives = livesContext.livesResource()
  if (!lives && !livesContext.livesResource.loading) {
    livesContext.refreshLives()
  }
})

// livesResourceの変更をリアクティブに監視
createEffect(() => {
  const slug = shareSlug()
  const lives = livesContext.livesResource()

  if (lives) {
    // データが利用可能になった時点で自動実行
    const matchedLive = lives.find(live => live.share_slug === slug)
    if (matchedLive) {
      setCurrentLive(matchedLive)
      setlistContext.setCurrentLiveId(matchedLive.id)
    }
  }
})
```

#### 確認方法

ブラウザのコンソールで以下のログが順次表示されることを確認：

1. `SharePage: Loading live by slug: [slug]`
2. `fetchLives: Starting to load lives`
3. `API response: {data: Array(n), error: null}`
4. `SharePage: Lives resource updated: Array(n)`
5. `SharePage: Found live: {...}`

### 2. SolidJS Resourceの適切な使用パターン

#### 基本原則

- `onMount`：初期化処理のみ（データ取得のトリガー）
- `createEffect`：Resourceの変更をリアクティブに監視
- 非同期処理の完了を待たずに、データの変更を監視する

#### 推奨パターン

```typescript
function MyComponent() {
  const context = useContext()
  const [localState, setLocalState] = createSignal()

  // 初期化：データ取得のトリガーのみ
  onMount(() => {
    if (!context.resource() && !context.resource.loading) {
      context.refreshResource()
    }
  })

  // リアクティブな監視：データが更新された時の処理
  createEffect(() => {
    const data = context.resource()
    if (data) {
      // データが利用可能になった時の処理
      setLocalState(processData(data))
    }
  })

  return (
    <Show when={context.resource()}>
      {/* UI rendering */}
    </Show>
  )
}
```

### 3. 環境変数とデータソースの切り替え問題

#### 症状

- ローカルSupabaseに接続しているはずなのにモックデータが表示される
- または、モックデータを期待しているのに実際のAPIが呼ばれる

#### 原因

`packages/supabase-client`の条件分岐ロジックの複雑さ：

```typescript
const isLocalSupabase = import.meta.env?.VITE_SUPABASE_URL?.includes(
  'localhost:54321'
)
const isPlaceholder = import.meta.env?.VITE_SUPABASE_URL?.includes(
  'placeholder'
)

if (isPlaceholder && !isLocalSupabase) {
  // モックデータを使用
} else {
  // 実際のAPIを使用
}
```

#### 解決方法

1. **環境変数を明確に設定**：

   ```bash
   # ローカルSupabase使用時
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=[local-anon-key]

   # モックデータ使用時
   VITE_SUPABASE_URL=https://placeholder.supabase.co
   VITE_SUPABASE_ANON_KEY=placeholder-anon-key
   ```

2. **ブラウザコンソールで確認**：
   ```javascript
   // 環境変数とデータソースの確認
   console.log('🔧 Supabase Client Config:', {
     url: 'http://localhost:54321', // または placeholder
     env: 'vite',
     isLocalSupabase: true, // または false
     isPlaceholder: false, // または true
   })
   ```

### 4. TypeScript型エラーの対処

#### よくあるエラー

```typescript
// ❌ Property 'songs' does not exist on type 'SetlistItem'
item.songs?.title

// ❌ Object is possibly 'undefined'
lives.find(live => live.share_slug === slug)
```

#### 解決方法

```typescript
// ✅ 型安全なアクセス
item.songs?.title

// ✅ undefined チェック
const matchedLive = lives?.find(live => live.share_slug === slug)
if (matchedLive) {
  // 安全にアクセス
}

// ✅ Show コンポーネントでの型安全な表示
<Show when={lives()}>
  {(livesArray) => (
    // livesArray は Live[] 型として推論される
    <For each={livesArray()}>
      {(live) => <div>{live.title}</div>}
    </For>
  )}
</Show>
```

## 🛠️ デバッグ用ツールとテクニック

### 1. ブラウザ開発者ツール

#### Console ログの確認

- `🔧 Supabase Client Config:` - Supabaseクライアント設定
- `fetchLives: Starting to load lives` - Lives API呼び出し開始
- `API response:` - API レスポンス内容
- `SharePage: Lives resource updated:` - Resource更新通知

#### Network タブの確認

- Supabase APIへのリクエスト（`https://[project].supabase.co/rest/v1/`）
- レスポンスステータス（200 OK）
- レスポンスデータの内容

### 2. SolidJS Devtools

#### Resource の状態確認

```typescript
// Resource の現在の状態をログ出力
console.log('Resource state:', {
  data: resource(),
  loading: resource.loading,
  error: resource.error,
})
```

#### Effect の実行回数確認

```typescript
createEffect(() => {
  console.count('Effect execution count')
  // effect logic
})
```

### 3. 段階的デバッグ手順

1. **環境変数確認**

   ```javascript
   console.log(import.meta.env.VITE_SUPABASE_URL)
   console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
   ```

2. **API接続確認**
   - ブラウザのNetworkタブでAPI呼び出しを確認
   - レスポンスデータの内容を確認

3. **Resource状態確認**

   ```typescript
   console.log('Lives resource:', livesContext.livesResource())
   console.log('Resource loading:', livesContext.livesResource.loading)
   console.log('Resource error:', livesContext.livesResource.error)
   ```

4. **データフロー確認**
   - onMountの実行タイミング
   - createEffectの実行タイミング
   - データの更新タイミング

## 📋 チェックリスト

開発時に以下の項目を確認してください：

### 基本設定

- [ ] 環境変数（VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY）が設定されている
- [ ] Supabaseクライアント設定ログが正しい値を表示している
- [ ] ローカルSupabaseが起動している（`supabase status`）

### データフロー

- [ ] API呼び出しが正常に実行されている（Network タブ）
- [ ] Resourceが適切に更新されている（Console ログ）
- [ ] createEffectが期待通りに実行されている
- [ ] UIが正しくデータを表示している

### エラーハンドリング

- [ ] ErrorBoundaryが設定されている
- [ ] Suspenseが適切に配置されている
- [ ] ローディング状態が適切に表示される
- [ ] エラー状態が適切に表示される

## 🚀 パフォーマンス最適化

### 1. 不要なAPI呼び出しの削減

```typescript
// ✅ 既にデータがある場合は再取得しない
if (!context.resource() && !context.resource.loading) {
  context.refreshResource()
}
```

### 2. 効率的なEffect使用

```typescript
// ✅ 依存関係を明確に
createEffect(() => {
  const slug = shareSlug() // この変更のみで再実行
  const lives = livesContext.livesResource()
  // slug または lives の変更時のみ実行
})
```

### 3. コンポーネント最適化

```typescript
// ✅ Show を使用した条件付きレンダリング
<Show when={data()} fallback={<Loading />}>
  {(dataValue) => <DataComponent data={dataValue()} />}
</Show>
```

このガイドを参考に、効率的にデバッグを進めてください。
