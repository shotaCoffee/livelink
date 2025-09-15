import { createStore } from 'solid-js/store'

export interface ErrorState {
  [key: string]: string | undefined
}

export const useErrorState = () => {
  const [errors, setErrors] = createStore<ErrorState>({})

  const addError = (key: string, message: string) => {
    setErrors(key, message)
    // 5秒後に自動クリア
    setTimeout(() => setErrors(key, undefined), 5000)
  }

  const clearError = (key: string) => setErrors(key, undefined)

  const clearAllErrors = () => {
    // 全てのエラーをクリア
    Object.keys(errors).forEach(key => setErrors(key, undefined))
  }

  const hasError = (key?: string) => {
    if (key) {
      return !!errors[key]
    }
    return Object.values(errors).some(error => !!error)
  }

  const getError = (key: string) => errors[key]

  const getAllErrors = () => {
    return Object.entries(errors)
      .filter(([_, error]) => !!error)
      .map(([key, error]) => ({ key, message: error! }))
  }

  return {
    errors,
    addError,
    clearError,
    clearAllErrors,
    hasError,
    getError,
    getAllErrors,
  }
}
