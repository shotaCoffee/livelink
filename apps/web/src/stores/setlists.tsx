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
import type { SetlistItem } from '@band-setlist/shared'
import { setlistQueries } from '@band-setlist/supabase-client'

interface SetlistActions {
  addSong: (liveId: string, songId: string) => Promise<boolean>
  removeSong: (setlistItemId: string) => Promise<boolean>
  updateOrder: (
    setlistItemId: string,
    newOrderIndex: number
  ) => Promise<boolean>
  clearSetlist: (liveId: string) => Promise<boolean>
  refreshSetlist: () => void
}

interface SetlistContextValue extends SetlistActions {
  setlistResource: Resource<SetlistItem[]>
  currentLiveId: () => string | undefined
  setCurrentLiveId: (liveId: string | undefined) => void
}

const SetlistContext = createContext<SetlistContextValue>()

export const SetlistProvider: ParentComponent = props => {
  // 現在選択中のライブID
  const [currentLiveId, setCurrentLiveId] = createSignal<string | undefined>()

  // createResourceでセットリストデータを取得
  const fetchSetlist = async (
    liveId: string | undefined
  ): Promise<SetlistItem[]> => {
    if (!liveId) {
      console.log('fetchSetlist: No live ID provided, returning empty array')
      return []
    }

    console.log('fetchSetlist: Starting to load setlist for live:', liveId)

    // Check if we should use mock data (placeholder config)
    const isLocalSupabase = import.meta.env?.VITE_SUPABASE_URL?.includes(
      'localhost:54321'
    )
    const isPlaceholder = import.meta.env?.VITE_SUPABASE_URL?.includes(
      'placeholder'
    )

    if (isPlaceholder && !isLocalSupabase) {
      console.warn(
        'Development mode: Using mock setlist data for live:',
        liveId
      )
      const mockSetlist: SetlistItem[] = [
        {
          id: '1',
          live_id: liveId,
          song_id: '1',
          order_index: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          songs: {
            id: '1',
            band_id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'サンプル楽曲 1',
            artist: 'サンプルアーティスト',
            youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            spotify_url:
              'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        {
          id: '2',
          live_id: liveId,
          song_id: '2',
          order_index: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          songs: {
            id: '2',
            band_id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'サンプル楽曲 2',
            artist: 'サンプルアーティスト 2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      ]
      console.log('Returning mock setlist data:', mockSetlist)
      return mockSetlist
    }

    console.log('Fetching setlist with live ID from API:', liveId)
    const response = await setlistQueries.getByLiveId(liveId)
    console.log('API response for setlist:', response)

    if (response.error) {
      console.error('Error loading setlist:', response.error)
      throw new Error(response.error)
    }

    // レスポンスデータが配列であることを確認
    const setlistData = Array.isArray(response.data) ? response.data : []
    console.log('Returning setlist data count:', setlistData.length)
    console.log('Setlist data:', setlistData)
    if (setlistData.length > 0) {
      console.log('First item songs data:', setlistData[0]?.songs)
    }
    return setlistData
  }

  // createResourceを使ってデータ取得（currentLiveIdをソースとする）
  const [setlistResource, { mutate, refetch }] = createResource(
    currentLiveId,
    fetchSetlist
  )

  // データをリフレッシュする関数
  const refreshSetlist = () => {
    // Resource を強制的に refetch する
    refetch()
  }

  const addSong = async (liveId: string, songId: string): Promise<boolean> => {
    try {
      // Check if we should use mock data
      const isLocalSupabase = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'localhost:54321'
      )
      const isPlaceholder = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'placeholder'
      )

      // Calculate new order index
      const currentItems = setlistResource() || []
      const newOrderIndex =
        Math.max(...currentItems.map(item => item.order_index), 0) + 1

      if (isPlaceholder && !isLocalSupabase) {
        console.warn('Development mode: Mocking add song to setlist')
        // 楽観的更新 - 新しい曲を最後に追加
        mutate(prev => {
          if (!prev) return prev
          const newItem: SetlistItem = {
            id: Date.now().toString(),
            live_id: liveId,
            song_id: songId,
            order_index: newOrderIndex,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            songs: {
              id: songId,
              band_id: '550e8400-e29b-41d4-a716-446655440000',
              title: `楽曲 ${songId}`,
              artist: 'アーティスト',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          }
          return [...prev, newItem]
        })
        return true
      }

      // 楽観的更新用の仮のアイテム
      const tempItem: SetlistItem = {
        id: 'temp-' + Date.now(),
        live_id: liveId,
        song_id: songId,
        order_index: newOrderIndex,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        songs: {
          id: songId,
          band_id: '550e8400-e29b-41d4-a716-446655440000',
          title: '楽曲を追加中...',
          artist: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }

      // 即座にUIを更新（楽観的更新）
      mutate(prev => (prev ? [...prev, tempItem] : [tempItem]))

      try {
        const response = await setlistQueries.addSong(
          liveId,
          songId,
          newOrderIndex
        )

        if (response.error) {
          throw new Error(response.error)
        }

        // 成功したら再フェッチして実際のデータに置き換え
        refetch()
        return true
      } catch (error) {
        // エラーの場合、楽観的更新をロールバック
        mutate(prev => prev?.filter(item => item.id !== tempItem.id))
        throw error
      }
    } catch (error) {
      console.error('addSong error:', error)
      throw error
    }
  }

  const removeSong = async (setlistItemId: string): Promise<boolean> => {
    try {
      // Check if we should use mock data
      const isLocalSupabase = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'localhost:54321'
      )
      const isPlaceholder = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'placeholder'
      )

      if (isPlaceholder && !isLocalSupabase) {
        console.warn('Development mode: Mocking remove song from setlist')
        // 楽観的更新
        mutate(prev => prev?.filter(item => item.id !== setlistItemId))
        return true
      }

      // 削除対象のアイテムを保存（ロールバック用）
      const itemToDelete = setlistResource()?.find(
        item => item.id === setlistItemId
      )

      // 楽観的更新：即座にUIから削除
      mutate(prev => prev?.filter(item => item.id !== setlistItemId))

      try {
        const response = await setlistQueries.removeSong(setlistItemId)

        if (response.error) {
          throw new Error(response.error)
        }

        // 成功したら再フェッチして確認
        refetch()
        return true
      } catch (error) {
        // エラーの場合、削除したアイテムを復元
        if (itemToDelete) {
          mutate(prev =>
            prev
              ? [...prev, itemToDelete].sort(
                  (a, b) => a.order_index - b.order_index
                )
              : [itemToDelete]
          )
        }
        throw error
      }
    } catch (error) {
      console.error('removeSong error:', error)
      throw error
    }
  }

  const updateOrder = async (
    setlistItemId: string,
    newOrderIndex: number
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
        console.warn('Development mode: Mocking update song order in setlist')
        // 楽観的更新
        mutate(prev => {
          if (!prev) return prev
          const updated = prev.map(item =>
            item.id === setlistItemId
              ? { ...item, order_index: newOrderIndex }
              : item
          )
          return updated.sort((a, b) => a.order_index - b.order_index)
        })
        return true
      }

      try {
        const response = await setlistQueries.updateOrder(
          setlistItemId,
          newOrderIndex
        )

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
      console.error('updateOrder error:', error)
      throw error
    }
  }

  const clearSetlist = async (liveId: string): Promise<boolean> => {
    try {
      // Check if we should use mock data
      const isLocalSupabase = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'localhost:54321'
      )
      const isPlaceholder = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'placeholder'
      )

      if (isPlaceholder && !isLocalSupabase) {
        console.warn('Development mode: Mocking clear setlist')
        // 楽観的更新
        mutate([])
        return true
      }

      // 削除対象のアイテム一覧を保存（ロールバック用）
      const itemsToDelete = setlistResource() || []

      // 楽観的更新：即座に全てをクリア
      mutate([])

      try {
        const response = await setlistQueries.clearSetlist(liveId)

        if (response.error) {
          throw new Error(response.error)
        }

        // 成功したら再フェッチして確認
        refetch()
        return true
      } catch (error) {
        // エラーの場合、クリアしたアイテムを復元
        mutate(itemsToDelete)
        throw error
      }
    } catch (error) {
      console.error('clearSetlist error:', error)
      throw error
    }
  }

  // コンテキスト値を作成
  const contextValue: SetlistContextValue = {
    setlistResource,
    currentLiveId,
    setCurrentLiveId,
    addSong,
    removeSong,
    updateOrder,
    clearSetlist,
    refreshSetlist,
  }

  return (
    <SetlistContext.Provider value={contextValue}>
      <ErrorBoundary
        fallback={err => <div class="text-red-600">エラー: {err.message}</div>}
      >
        <Suspense fallback={<div class="text-gray-500">読み込み中...</div>}>
          {props.children}
        </Suspense>
      </ErrorBoundary>
    </SetlistContext.Provider>
  )
}

export const useSetlist = () => {
  const context = useContext(SetlistContext)

  if (!context) {
    throw new Error('useSetlist must be used within a SetlistProvider')
  }
  return context
}
