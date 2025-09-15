import { createSignal, createEffect, onCleanup } from 'solid-js'

export interface PerformanceMetrics {
  renderCount: number
  lastRenderTime: number
  averageRenderTime: number
  apiCallCount: number
  averageApiTime: number
  memoryUsage?: number
  errorCount: number
}

export interface ApiCallMetric {
  endpoint: string
  startTime: number
  duration: number
  success: boolean
}

export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = createSignal<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    apiCallCount: 0,
    averageApiTime: 0,
    errorCount: 0,
  })

  const [apiCalls, setApiCalls] = createSignal<ApiCallMetric[]>([])
  const [renderTimes, setRenderTimes] = createSignal<number[]>([])

  let renderStartTime = 0

  // レンダリング開始時刻を記録
  const startRender = () => {
    renderStartTime = performance.now()
  }

  // レンダリング終了時刻を記録
  const endRender = () => {
    if (renderStartTime === 0) return

    const renderTime = performance.now() - renderStartTime
    const currentMetrics = metrics()
    const currentRenderTimes = renderTimes()

    const newRenderTimes = [...currentRenderTimes, renderTime].slice(-10) // 最新10回を保持
    const averageRenderTime =
      newRenderTimes.reduce((sum, time) => sum + time, 0) /
      newRenderTimes.length

    setRenderTimes(newRenderTimes)
    setMetrics({
      ...currentMetrics,
      renderCount: currentMetrics.renderCount + 1,
      lastRenderTime: renderTime,
      averageRenderTime,
    })

    renderStartTime = 0
  }

  // API呼び出しの追跡
  const trackApiCall = (endpoint: string): (() => void) => {
    const startTime = performance.now()

    return (success: boolean = true) => {
      const duration = performance.now() - startTime
      const currentMetrics = metrics()
      const currentApiCalls = apiCalls()

      const newApiCall: ApiCallMetric = {
        endpoint,
        startTime,
        duration,
        success,
      }

      const newApiCalls = [...currentApiCalls, newApiCall].slice(-20) // 最新20回を保持
      const averageApiTime =
        newApiCalls
          .filter(call => call.success)
          .reduce((sum, call) => sum + call.duration, 0) /
          newApiCalls.filter(call => call.success).length || 0

      setApiCalls(newApiCalls)
      setMetrics({
        ...currentMetrics,
        apiCallCount: currentMetrics.apiCallCount + 1,
        averageApiTime,
        errorCount: success
          ? currentMetrics.errorCount
          : currentMetrics.errorCount + 1,
      })
    }
  }

  // メモリ使用量の監視
  const updateMemoryUsage = () => {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memoryInfo.usedJSHeapSize / 1024 / 1024, // MB
      }))
    }
  }

  // 定期的なメモリ使用量の更新
  const memoryInterval = setInterval(updateMemoryUsage, 5000) // 5秒ごと

  onCleanup(() => {
    clearInterval(memoryInterval)
  })

  // 開発環境でのパフォーマンス警告
  createEffect(() => {
    if (import.meta.env.DEV) {
      const currentMetrics = metrics()

      // レンダリング時間の警告
      if (currentMetrics.lastRenderTime > 16.67) {
        // 60FPS閾値
        console.warn(
          `🐌 [${componentName}] Slow render detected: ${currentMetrics.lastRenderTime.toFixed(2)}ms`
        )
      }

      // API呼び出し時間の警告
      if (currentMetrics.averageApiTime > 1000) {
        // 1秒閾値
        console.warn(
          `🐌 [${componentName}] Slow API calls detected: ${currentMetrics.averageApiTime.toFixed(2)}ms average`
        )
      }

      // エラー率の警告
      const errorRate =
        currentMetrics.errorCount / Math.max(currentMetrics.apiCallCount, 1)
      if (errorRate > 0.1) {
        // 10%閾値
        console.warn(
          `❌ [${componentName}] High error rate detected: ${(errorRate * 100).toFixed(1)}%`
        )
      }
    }
  })

  // レンダリング数の自動追跡
  createEffect(() => {
    startRender()
    // エフェクトの実行はレンダリング後なので、次のフレームで終了を記録
    requestAnimationFrame(() => endRender())
  })

  // パフォーマンスレポートの生成
  const generateReport = () => {
    const currentMetrics = metrics()
    const recentApiCalls = apiCalls().slice(-10)

    return {
      component: componentName,
      metrics: currentMetrics,
      recentApiCalls,
      recommendations: generateRecommendations(currentMetrics),
    }
  }

  const generateRecommendations = (currentMetrics: PerformanceMetrics) => {
    const recommendations: string[] = []

    if (currentMetrics.averageRenderTime > 16.67) {
      recommendations.push(
        'Consider using createMemo for expensive calculations'
      )
      recommendations.push(
        'Check for unnecessary re-renders with tracking scopes'
      )
    }

    if (currentMetrics.averageApiTime > 1000) {
      recommendations.push('Consider implementing request caching')
      recommendations.push('Optimize API queries and consider pagination')
    }

    if (currentMetrics.memoryUsage && currentMetrics.memoryUsage > 50) {
      recommendations.push(
        'Monitor memory leaks in effects and event listeners'
      )
      recommendations.push('Consider implementing cleanup in onCleanup()')
    }

    const errorRate =
      currentMetrics.errorCount / Math.max(currentMetrics.apiCallCount, 1)
    if (errorRate > 0.05) {
      recommendations.push('Improve error handling and retry mechanisms')
    }

    return recommendations
  }

  // 開発ツール用のグローバル関数
  if (import.meta.env.DEV) {
    ;(window as any)[`__PERF_${componentName}`] = {
      getMetrics: () => metrics(),
      getReport: generateReport,
      reset: () => {
        setMetrics({
          renderCount: 0,
          lastRenderTime: 0,
          averageRenderTime: 0,
          apiCallCount: 0,
          averageApiTime: 0,
          errorCount: 0,
        })
        setApiCalls([])
        setRenderTimes([])
      },
    }
  }

  return {
    metrics,
    trackApiCall,
    generateReport,
    updateMemoryUsage,
  }
}
