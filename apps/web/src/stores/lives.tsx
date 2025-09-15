import {
  createContext,
  useContext,
  ParentComponent,
  createResource,
  createSignal,
  Resource,
  Suspense,
  ErrorBoundary,
} from 'solid-js'
import type { Live, LiveFormData } from '@band-setlist/shared'
import { liveQueries } from '@band-setlist/supabase-client'

interface LivesActions {
  createLive: (liveData: LiveFormData) => Promise<boolean>
  updateLive: (id: string, updates: Partial<LiveFormData>) => Promise<boolean>
  deleteLive: (id: string) => Promise<boolean>
  refreshLives: () => void
}

interface LivesContextValue extends LivesActions {
  livesResource: Resource<Live[]>
}

const LivesContext = createContext<LivesContextValue>()

export const LivesProvider: ParentComponent = props => {
  // リフレッシュトリガー用のシグナル（refetchが使われるようになったが、resourceは維持）
  const [refreshTrigger] = createSignal(0)

  // Mock band ID for now - in real app this would come from auth/band context
  // Using valid UUID format for database compatibility
  const getBandId = () => '550e8400-e29b-41d4-a716-446655440000'

  // createResourceを使ってlivesデータを取得
  const fetchLives = async (): Promise<Live[]> => {
    console.log('fetchLives: Starting to load lives')

    // Check if we should use mock data (placeholder config)
    const isLocalSupabase = import.meta.env?.VITE_SUPABASE_URL?.includes(
      'localhost:54321'
    )
    const isPlaceholder = import.meta.env?.VITE_SUPABASE_URL?.includes(
      'placeholder'
    )

    console.log('Environment check:', {
      isLocalSupabase,
      isPlaceholder,
      supabaseUrl: import.meta.env?.VITE_SUPABASE_URL,
    })

    if (isPlaceholder && !isLocalSupabase) {
      console.warn('Development mode: Using mock live data')
      const mockLives: Live[] = [
        {
          id: '1',
          band_id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'サンプルライブ 1',
          venue: 'サンプル会場',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          description: 'サンプルライブの説明文です。',
          is_upcoming: true,
          share_slug: 'sample-live-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          band_id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'サンプルライブ 2',
          venue: 'サンプル会場 2',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          description: '過去のライブです。',
          is_upcoming: false,
          share_slug: 'sample-live-2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          band_id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'ARUMONA 2025',
          venue: '渋谷クラブ',
          date: new Date('2025-12-25').toISOString(),
          description: 'ARUMONAの年末ライブです。',
          is_upcoming: true,
          share_slug: 'arumona-2025',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
      console.log('Returning mock data:', mockLives)
      return mockLives
    }

    console.log('Fetching lives with band ID:', getBandId())
    const response = await liveQueries.getAll(getBandId())
    console.log('API response:', response)

    if (response.error) {
      console.error('Error loading lives:', response.error)
      throw new Error(response.error)
    }

    // レスポンスデータが配列であることを確認
    const livesData = Array.isArray(response.data) ? response.data : []
    console.log('Returning lives data:', livesData)
    return livesData
  }

  // createResourceを使ってデータ取得
  const [livesResource, { mutate, refetch }] = createResource(
    refreshTrigger,
    fetchLives
  )

  // データをリフレッシュする関数
  const refreshLives = () => {
    refetch()
  }

  const createLive = async (liveData: LiveFormData): Promise<boolean> => {
    try {
      // Check if we should use mock data
      const isLocalSupabase = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'localhost:54321'
      )
      const isPlaceholder = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'placeholder'
      )

      if (isPlaceholder && !isLocalSupabase) {
        console.warn('Development mode: Mocking live creation')
        const newLive: Live = {
          id: Date.now().toString(),
          band_id: getBandId(),
          ...liveData,
          is_upcoming: liveData.is_upcoming ?? true,
          share_slug:
            liveData.title.toLowerCase().replace(/\s+/g, '-') +
            '-' +
            Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // 楽観的更新
        mutate(prev => (prev ? [newLive, ...prev] : [newLive]))
        return true
      }

      // 楽観的更新用の仮のライブ
      const tempLive: Live = {
        id: 'temp-' + Date.now(),
        band_id: getBandId(),
        ...liveData,
        is_upcoming: liveData.is_upcoming ?? true,
        share_slug:
          liveData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // 即座にUIを更新（楽観的更新）
      mutate(prev => (prev ? [tempLive, ...prev] : [tempLive]))

      try {
        const response = await liveQueries.create(getBandId(), liveData)

        if (response.error) {
          throw new Error(response.error)
        }

        // 成功したら再フェッチして正確なデータに置き換え
        refetch()
        return true
      } catch (error) {
        // エラーの場合、楽観的更新をロールバック
        mutate(prev => prev?.filter(live => live.id !== tempLive.id))
        throw error
      }
    } catch (error) {
      console.error('createLive error:', error)
      throw error
    }
  }

  const updateLive = async (
    id: string,
    updates: Partial<LiveFormData>
  ): Promise<boolean> => {
    try {
      // Check if we should use mock data
      const isLocalSupabase = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'localhost:54321'
      )
      const isPlaceholder = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'placeholder'
      )

      if (isPlaceholder && !isLocalSupabase) {
        console.warn('Development mode: Mocking live update')
        // 楽観的更新
        mutate(prev =>
          prev?.map(live =>
            live.id === id
              ? { ...live, ...updates, updated_at: new Date().toISOString() }
              : live
          )
        )
        return true
      }

      // 楽観的更新
      mutate(prev =>
        prev?.map(live =>
          live.id === id
            ? { ...live, ...updates, updated_at: new Date().toISOString() }
            : live
        )
      )

      try {
        const response = await liveQueries.update(id, updates)

        if (response.error) {
          throw new Error(response.error)
        }

        // 成功したら再フェッチして正確なデータに置き換え
        refetch()
        return true
      } catch (error) {
        // エラーの場合、再フェッチで元の状態に戻す
        refetch()
        throw error
      }
    } catch (error) {
      console.error('updateLive error:', error)
      throw error
    }
  }

  const deleteLive = async (id: string): Promise<boolean> => {
    try {
      // Check if we should use mock data
      const isLocalSupabase = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'localhost:54321'
      )
      const isPlaceholder = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'placeholder'
      )

      if (isPlaceholder && !isLocalSupabase) {
        console.warn('Development mode: Mocking live deletion')
        // 楽観的更新
        mutate(prev => prev?.filter(live => live.id !== id))
        return true
      }

      // 削除対象のライブを保存（ロールバック用）
      const liveToDelete = livesResource()?.find(live => live.id === id)

      // 楽観的更新：即座にUIから削除
      mutate(prev => prev?.filter(live => live.id !== id))

      try {
        const response = await liveQueries.delete(id)

        if (response.error) {
          throw new Error(response.error)
        }

        // 成功したら再フェッチして確認
        refetch()
        return true
      } catch (error) {
        // エラーの場合、削除したライブを復元
        if (liveToDelete) {
          mutate(prev =>
            prev
              ? [...prev, liveToDelete].sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
              : [liveToDelete]
          )
        }
        throw error
      }
    } catch (error) {
      console.error('deleteLive error:', error)
      throw error
    }
  }

  // コンテキスト値を更新
  const contextValue: LivesContextValue = {
    livesResource,
    createLive,
    updateLive,
    deleteLive,
    refreshLives,
  }

  return (
    <LivesContext.Provider value={contextValue}>
      <ErrorBoundary
        fallback={err => <div class="text-red-600">エラー: {err.message}</div>}
      >
        <Suspense fallback={<div class="text-gray-500">読み込み中...</div>}>
          {props.children}
        </Suspense>
      </ErrorBoundary>
    </LivesContext.Provider>
  )
}

export const useLives = () => {
  const context = useContext(LivesContext)

  if (!context) {
    throw new Error('useLives must be used within a LivesProvider')
  }
  return context
}
