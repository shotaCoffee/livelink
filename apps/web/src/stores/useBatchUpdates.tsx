import { batch } from 'solid-js'

export interface BatchOperation {
  operation: () => void
  description?: string
}

export const useBatchUpdates = () => {
  // 複数の操作をバッチで実行
  const executeBatch = (operations: BatchOperation[]) => {
    batch(() => {
      operations.forEach(({ operation, description }) => {
        try {
          operation()
        } catch (error) {
          console.error(`Batch operation failed: ${description}`, error)
        }
      })
    })
  }

  // ローディング状態とデータの同時更新
  const updateWithLoading = (
    setLoading: (loading: boolean) => void,
    setData: (data: any) => void,
    setError: (error: any) => void,
    data: any,
    error: any = null
  ) => {
    batch(() => {
      setLoading(false)
      setData(data)
      setError(error)
    })
  }

  // 複数リソースの同時更新
  const updateMultipleResources = (
    updates: Array<{ mutate: Function; data: any }>
  ) => {
    batch(() => {
      updates.forEach(({ mutate, data }) => {
        mutate(data)
      })
    })
  }

  // Form状態の一括更新
  const updateFormStates = (
    setters: Array<{ setter: Function; value: any; description?: string }>
  ) => {
    batch(() => {
      setters.forEach(({ setter, value, description }) => {
        try {
          setter(value)
        } catch (error) {
          console.error(`Form state update failed: ${description}`, error)
        }
      })
    })
  }

  // エラー状態の一括クリア
  const clearAllErrors = (errorClearFunctions: Array<() => void>) => {
    batch(() => {
      errorClearFunctions.forEach(clearFn => {
        try {
          clearFn()
        } catch (error) {
          console.error('Error clearing failed:', error)
        }
      })
    })
  }

  return {
    executeBatch,
    updateWithLoading,
    updateMultipleResources,
    updateFormStates,
    clearAllErrors,
  }
}
