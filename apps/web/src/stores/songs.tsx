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
import type { Song, SongFormData } from '@band-setlist/shared'
import { songQueries } from '@band-setlist/supabase-client'

interface SongsActions {
  createSong: (songData: SongFormData) => Promise<boolean>
  updateSong: (id: string, updates: Partial<SongFormData>) => Promise<boolean>
  deleteSong: (id: string) => Promise<boolean>
  setSearchQuery: (query: string) => void
  refreshSongs: () => void
}

interface SongsContextValue extends SongsActions {
  songsResource: Resource<Song[]>
  searchQuery: () => string
}

const SongsContext = createContext<SongsContextValue>()

export const SongsProvider: ParentComponent = props => {
  // 検索クエリシグナル
  const [searchQuery, setSearchQuery] = createSignal<string>('')

  // Mock band ID for now - in real app this would come from auth/band context
  // Using valid UUID format for database compatibility
  const getBandId = () => '550e8400-e29b-41d4-a716-446655440000'

  // createResourceで使用するフェッチ関数
  const fetchSongs = async (query: string): Promise<Song[]> => {
    console.log('fetchSongs: Starting to load songs', { query })

    // Check if we should use mock data (placeholder config)
    const isLocalSupabase = import.meta.env?.VITE_SUPABASE_URL?.includes(
      'localhost:54321'
    )
    const isPlaceholder = import.meta.env?.VITE_SUPABASE_URL?.includes(
      'placeholder'
    )

    if (isPlaceholder && !isLocalSupabase) {
      console.warn('Development mode: Using mock song data')
      const mockSongs: Song[] = [
        {
          id: '1',
          band_id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'サンプル楽曲 1',
          artist: 'サンプルアーティスト',
          youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          spotify_url: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          band_id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'サンプル楽曲 2',
          artist: 'サンプルアーティスト 2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      // 検索クエリがある場合はフィルタリング
      if (query) {
        const filteredSongs = mockSongs.filter(
          song =>
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase())
        )
        console.log('Filtered mock songs:', filteredSongs)
        return filteredSongs
      }

      console.log('Returning all mock songs:', mockSongs)
      return mockSongs
    }

    // 実際のAPI呼び出し
    console.log(
      'Fetching songs with band ID:',
      getBandId(),
      'search query:',
      query
    )

    const response = query
      ? await songQueries.search(getBandId(), query)
      : await songQueries.getAll(getBandId())

    console.log('API response:', response)

    if (response.error) {
      console.error('Error loading songs:', response.error)
      throw new Error(response.error)
    }

    // レスポンスデータが配列であることを確認
    const songsData = Array.isArray(response.data) ? response.data : []
    console.log('Returning songs data:', songsData)
    return songsData
  }

  // createResourceを使ってデータ取得（検索クエリをソースとする）
  const [songsResource, { mutate, refetch }] = createResource(
    searchQuery,
    fetchSongs
  )

  // データをリフレッシュする関数
  const refreshSongs = () => {
    // Resource を強制的に refetch する
    refetch()
  }

  // CRUD操作の実装
  const createSong = async (songData: SongFormData): Promise<boolean> => {
    try {
      // Check if we should use mock data
      const isLocalSupabase = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'localhost:54321'
      )
      const isPlaceholder = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'placeholder'
      )

      if (isPlaceholder && !isLocalSupabase) {
        console.warn('Development mode: Mocking song creation')
        const newSong: Song = {
          id: Date.now().toString(),
          band_id: getBandId(),
          ...songData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // 楽観的更新
        mutate(prev => (prev ? [newSong, ...prev] : [newSong]))
        return true
      }

      // 楽観的更新用の仮のソング
      const tempSong: Song = {
        id: 'temp-' + Date.now(),
        band_id: getBandId(),
        ...songData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // 即座にUIを更新（楽観的更新）
      mutate(prev => (prev ? [tempSong, ...prev] : [tempSong]))

      try {
        const response = await songQueries.create(getBandId(), songData)

        if (response.error) {
          throw new Error(response.error)
        }

        // 成功したらデータをリフェッチして正確なデータに置き換え
        refetch()
        return true
      } catch (error) {
        // エラーの場合、楽観的更新をロールバック
        mutate(prev => prev?.filter(song => song.id !== tempSong.id))
        throw error
      }
    } catch (error) {
      console.error('createSong error:', error)
      throw error
    }
  }

  const updateSong = async (
    id: string,
    updates: Partial<SongFormData>
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
        console.warn('Development mode: Mocking song update')
        // 楽観的更新
        mutate(prev =>
          prev?.map(song =>
            song.id === id
              ? { ...song, ...updates, updated_at: new Date().toISOString() }
              : song
          )
        )
        return true
      }

      try {
        const response = await songQueries.update(id, updates)

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
      console.error('updateSong error:', error)
      throw error
    }
  }

  const deleteSong = async (id: string): Promise<boolean> => {
    try {
      // Check if we should use mock data
      const isLocalSupabase = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'localhost:54321'
      )
      const isPlaceholder = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'placeholder'
      )

      if (isPlaceholder && !isLocalSupabase) {
        console.warn('Development mode: Mocking song deletion')
        // 楽観的更新
        mutate(prev => prev?.filter(song => song.id !== id))
        return true
      }

      // 削除対象の楽曲を保存（ロールバック用）
      const songToDelete = songsResource()?.find(song => song.id === id)

      // 楽観的更新：即座にUIから削除
      mutate(prev => prev?.filter(song => song.id !== id))

      try {
        const response = await songQueries.delete(id)

        if (response.error) {
          throw new Error(response.error)
        }

        // 成功したら再フェッチして確認
        refetch()
        return true
      } catch (error) {
        // エラーの場合、削除した楽曲を復元
        if (songToDelete) {
          mutate(prev =>
            prev
              ? [...prev, songToDelete].sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
              : [songToDelete]
          )
        }
        throw error
      }
    } catch (error) {
      console.error('deleteSong error:', error)
      throw error
    }
  }

  // コンテキスト値を更新
  const contextValue: SongsContextValue = {
    songsResource,
    searchQuery,
    createSong,
    updateSong,
    deleteSong,
    setSearchQuery,
    refreshSongs,
  }

  return (
    <SongsContext.Provider value={contextValue}>
      <ErrorBoundary
        fallback={err => <div class="text-red-600">エラー: {err.message}</div>}
      >
        <Suspense fallback={<div class="text-gray-500">読み込み中...</div>}>
          {props.children}
        </Suspense>
      </ErrorBoundary>
    </SongsContext.Provider>
  )
}

export const useSongs = () => {
  const context = useContext(SongsContext)
  if (!context) {
    throw new Error('useSongs must be used within a SongsProvider')
  }
  return context
}
