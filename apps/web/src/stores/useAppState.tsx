import { createMemo } from 'solid-js'
import { useAuth } from './auth'
import { useSongs } from './songs'
import { useLives } from './lives'
import { useSetlist } from './setlists'
import { useErrorState } from './useErrorState'
import { useBatchUpdates } from './useBatchUpdates'

export const useAppState = () => {
  const auth = useAuth()
  const songs = useSongs()
  const lives = useLives()
  const setlist = useSetlist()
  const errorState = useErrorState()
  const batchUpdates = useBatchUpdates()

  // クロスドメインの計算ロジック - メモ化により効率的に
  const availableSongs = createMemo(() => {
    const allSongs = songs.songsResource() || []
    const setlistItems = setlist.setlistResource() || []
    const usedSongIds = new Set(setlistItems.map(item => item.song_id))
    return allSongs.filter(song => !usedSongIds.has(song.id))
  })

  // 現在選択中のライブの詳細情報
  const currentLive = createMemo(() => {
    const currentLiveId = setlist.currentLiveId()
    if (!currentLiveId) return null

    const livesData = lives.livesResource()
    return livesData?.find(live => live.id === currentLiveId) || null
  })

  // 全体的なローディング状態
  const isLoading = createMemo(() => {
    return (
      songs.songsResource.loading ||
      lives.livesResource.loading ||
      setlist.setlistResource.loading
    )
  })

  // 全体的なエラー状態
  const hasError = createMemo(() => {
    return (
      !!songs.songsResource.error ||
      !!lives.livesResource.error ||
      !!setlist.setlistResource.error
    )
  })

  // エラーメッセージの配列
  const errorMessages = createMemo(() => {
    const errors = []
    if (songs.songsResource.error)
      errors.push(`楽曲: ${songs.songsResource.error.message}`)
    if (lives.livesResource.error)
      errors.push(`ライブ: ${lives.livesResource.error.message}`)
    if (setlist.setlistResource.error)
      errors.push(`セットリスト: ${setlist.setlistResource.error.message}`)
    return errors
  })

  // 改善されたエラーハンドリング付きのアクション
  const createSongWithErrorHandling = async (songData: any) => {
    try {
      errorState.clearError('songs')
      return await songs.createSong(songData)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '楽曲の作成に失敗しました'
      errorState.addError('songs', message)
      return false
    }
  }

  const createLiveWithErrorHandling = async (liveData: any) => {
    try {
      errorState.clearError('lives')
      return await lives.createLive(liveData)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'ライブの作成に失敗しました'
      errorState.addError('lives', message)
      return false
    }
  }

  const addSongToSetlistWithErrorHandling = async (
    liveId: string,
    songId: string
  ) => {
    try {
      errorState.clearError('setlist')
      return await setlist.addSong(liveId, songId)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'セットリストへの追加に失敗しました'
      errorState.addError('setlist', message)
      return false
    }
  }

  return {
    // 個別ストア
    auth,
    songs,
    lives,
    setlist,

    // エラー状態管理
    errorState,

    // 統合された計算値
    availableSongs,
    currentLive,
    isLoading,
    hasError,
    errorMessages,

    // エラーハンドリング付きアクション
    createSongWithErrorHandling,
    createLiveWithErrorHandling,
    addSongToSetlistWithErrorHandling,

    // 便利なアクション
    refreshAll: () => {
      // バッチで全てのリソースを同時リフレッシュ
      batchUpdates.executeBatch([
        { operation: () => songs.refreshSongs(), description: 'Refresh songs' },
        { operation: () => lives.refreshLives(), description: 'Refresh lives' },
        {
          operation: () => setlist.refreshSetlist(),
          description: 'Refresh setlist',
        },
      ])
    },

    // バッチ更新ユーティリティ
    batchUpdates,
  }
}
