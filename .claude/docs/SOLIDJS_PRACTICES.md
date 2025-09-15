# SolidJS 実装プラクティス

SolidJSの公式ドキュメント（https://www.solidjs.com/docs/latest/api）に基づく実装ベストプラクティスです。

## データ取得パターン

### 1. createResource の基本利用

```typescript
// 基本的な使用法
const [data] = createResource(fetchFunction)

// ソース付きの使用法（ソースが変更されると再実行される）
const [data] = createResource(source, fetchFunction)
```

### 2. リソース状態の管理

createResourceは以下の状態プロパティを提供します：

```typescript
const [resource, { mutate, refetch }] = createResource(fetchData)

// 状態チェック
resource.loading // 読み込み中
resource.error // エラー発生時
resource() // データ（Suspenseをトリガー）
resource.latest // 最新データ（Suspenseをトリガーしない）
resource.state // 'unresolved' | 'pending' | 'ready' | 'refreshing' | 'errored'
```

### 3. エラーハンドリング

```typescript
// ErrorBoundaryを使用
import { ErrorBoundary } from 'solid-js';

<ErrorBoundary fallback={(err) => <div>Error: {err.message}</div>}>
  <DataComponent />
</ErrorBoundary>

// リソースレベルでのエラーハンドリング
<Switch>
  <Match when={resource.error}>
    <div>Error: {resource.error.message}</div>
  </Match>
  <Match when={resource()}>
    <DataDisplay data={resource()} />
  </Match>
</Switch>
```

### 4. Suspense境界

```typescript
import { Suspense } from 'solid-js';

<Suspense fallback={<div>Loading...</div>}>
  <DataComponent />
</Suspense>
```

## 現在の実装における問題点

### Lives実装の問題

1. **冗長な状態管理**: createStoreとcreateResourceを混在させている
2. **手動状態更新**: リソース状態を手動でstoreに反映している
3. **複雑なロジック**: onMountでrefreshLivesを呼び出す不適切な設計
4. **型定義の不整合**: livesResourceの型がanyになっている

### Songs実装の問題

1. **複雑なソース管理**: 複数のシグナルを配列で管理している
2. **重複するロジック**: ローディング状態の手動同期
3. **不要な複雑性**: createEffectでローディング状態を同期

## 推奨実装パターン

### 1. シンプルなデータ取得

```typescript
export const DataProvider: ParentComponent = (props) => {
  const [refreshTrigger, setRefreshTrigger] = createSignal(0);

  const [dataResource] = createResource(refreshTrigger, async () => {
    const response = await apiCall();
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  });

  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  const contextValue = {
    data: dataResource,
    refreshData,
    // CRUD operations that call refreshData after success
  };

  return (
    <DataContext.Provider value={contextValue}>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary fallback={(err) => <div>Error: {err}</div>}>
          {props.children}
        </ErrorBoundary>
      </Suspense>
    </DataContext.Provider>
  );
};
```

### 2. 検索機能付きデータ取得

```typescript
export const SearchableDataProvider: ParentComponent = (props) => {
  const [searchQuery, setSearchQuery] = createSignal('');

  const [dataResource] = createResource(searchQuery, async (query) => {
    const response = query
      ? await api.search(query)
      : await api.getAll();

    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  });

  const contextValue = {
    data: dataResource,
    searchQuery,
    setSearchQuery,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {props.children}
    </DataContext.Provider>
  );
};
```

### 3. 楽観的更新

```typescript
const updateItem = async (id: string, updates: any) => {
  const { mutate } = dataResource

  // 楽観的更新
  mutate(prev =>
    prev?.map(item => (item.id === id ? { ...item, ...updates } : item))
  )

  try {
    const response = await api.update(id, updates)
    if (response.error) {
      // 失敗時は元に戻す
      mutate(prev => originalData)
      throw new Error(response.error)
    }
    // 成功時は最新データで更新
    mutate(response.data)
  } catch (error) {
    // エラーハンドリング
  }
}
```

## 移行ガイドライン

### Phase 1: Lives実装の修正

1. createStoreを削除し、createResourceのみを使用
2. 手動ローディング状態管理を削除
3. onMountの不適切な使用を修正
4. ErrorBoundaryとSuspenseを適切に配置

### Phase 2: Songs実装の修正

1. 複雑なソース配列を単純化
2. createEffectによる手動同期を削除
3. 検索クエリをソースとして直接使用

### Phase 3: 統一されたパターンの確立

1. 共通のベースコンポーネント作成
2. 型定義の統一
3. エラーハンドリングパターンの統一

## ベストプラクティス

1. **Single Source of Truth**: createResourceを状態の唯一のソースとする
2. **Declarative**: 手続き的な状態更新ではなく、宣言的なパターンを使用
3. **Error Boundaries**: 適切なエラー境界を設定
4. **Suspense**: 非同期コンテンツには Suspense を使用
5. **Type Safety**: 適切な型定義を維持
6. **Separation of Concerns**: データ取得とUI表示を分離

この実装プラクティスに従うことで、SolidJSの反応性システムを最大限活用し、保守しやすく、パフォーマンスの良いコードを書くことができます。
