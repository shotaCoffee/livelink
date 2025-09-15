import { For, Show, createSignal, createMemo } from 'solid-js'
import { Card, CardContent, Button, Input } from '@band-setlist/ui'
import type { Song } from '@band-setlist/shared'
import { useSongs } from '../../stores/songs'
import { usePerformanceMonitor } from '../../stores/usePerformanceMonitor'
import SongFormModal from './SongFormModal'

export default function SongList() {
  const songs = useSongs()
  const [editingSong, setEditingSong] = createSignal<Song | undefined>()
  const [showConfirmDelete, setShowConfirmDelete] = createSignal<
    Song | undefined
  >()

  // 開発環境でのみパフォーマンス監視を有効化
  if (import.meta.env.DEV) {
    usePerformanceMonitor('SongList')
  }

  const handleEdit = (song: Song) => {
    setEditingSong(song)
  }

  const handleUpdate = async (updates: any) => {
    const song = editingSong()
    if (!song) return false

    const success = await songs.updateSong(song.id, updates)
    if (success) {
      setEditingSong(undefined)
    }
    return success
  }

  const handleDelete = async (song: Song) => {
    const success = await songs.deleteSong(song.id)
    if (success) {
      setShowConfirmDelete(undefined)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // リソースから取得したデータを使用（リアクティブに）
  const songList = () => songs.songsResource() || []

  // 正規化された検索クエリ（メモ化）
  const normalizedQuery = createMemo(() => {
    return songs.searchQuery().toLowerCase().trim()
  })

  // 楽曲の検索インデックス（メモ化）
  const songSearchIndex = createMemo(() => {
    const allSongs = songList()
    return allSongs.map(song => ({
      song,
      searchText: `${song.title} ${song.artist}`.toLowerCase(),
    }))
  })

  // 検索でフィルタリングされた楽曲リスト（高度なメモ化）
  const filteredSongs = createMemo(() => {
    const query = normalizedQuery()
    const searchIndex = songSearchIndex()

    if (!query) return searchIndex.map(item => item.song)

    // 複数キーワード検索対応
    const keywords = query.split(/\s+/).filter(k => k.length > 0)

    return searchIndex
      .filter(item =>
        keywords.every(keyword => item.searchText.includes(keyword))
      )
      .map(item => item.song)
  })

  return (
    <div class="space-y-6">
      {/* Search */}
      <div class="flex items-center space-x-4">
        <div class="flex-1">
          <Input
            type="text"
            placeholder="楽曲を検索..."
            value={songs.searchQuery()}
            onInput={e => songs.setSearchQuery(e.currentTarget.value)}
          />
        </div>
      </div>

      {/* Song List */}
      <Show
        when={filteredSongs().length > 0}
        fallback={
          <Card>
            <CardContent class="p-8 text-center">
              <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  class="w-8 h-8 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-secondary-900 mb-2">
                <Show when={songs.searchQuery} fallback="楽曲がまだありません">
                  検索結果が見つかりません
                </Show>
              </h3>
              <p class="text-secondary-600">
                <Show
                  when={songs.searchQuery}
                  fallback="最初の楽曲を追加して、セットリスト管理を始めましょう。"
                >
                  別のキーワードで検索してみてください。
                </Show>
              </p>
            </CardContent>
          </Card>
        }
      >
        <div class="grid gap-4">
          <For each={filteredSongs()}>
            {song => (
              <Card>
                <CardContent class="p-6">
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-4">
                        <div class="flex-1">
                          <h3 class="text-lg font-semibold text-secondary-900">
                            {song.title}
                          </h3>
                          <p class="text-secondary-600">{song.artist}</p>
                          <p class="text-sm text-secondary-500 mt-1">
                            追加日: {formatDate(song.created_at)}
                          </p>
                        </div>
                        <div class="flex space-x-2">
                          <Show when={song.youtube_url}>
                            <a
                              href={song.youtube_url!}
                              target="_blank"
                              rel="noopener noreferrer"
                              class="text-red-600 hover:text-red-700"
                              title="YouTubeで開く"
                            >
                              <svg
                                class="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                              </svg>
                            </a>
                          </Show>
                          <Show when={song.spotify_url}>
                            <a
                              href={song.spotify_url!}
                              target="_blank"
                              rel="noopener noreferrer"
                              class="text-green-600 hover:text-green-700"
                              title="Spotifyで開く"
                            >
                              <svg
                                class="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.479.179-.66.599-.78 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.84.18 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.48.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                              </svg>
                            </a>
                          </Show>
                        </div>
                      </div>
                    </div>
                    <div class="flex space-x-2 ml-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(song)}
                        disabled={songs.songsResource.loading}
                      >
                        編集
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setShowConfirmDelete(song)}
                        disabled={songs.songsResource.loading}
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </For>
        </div>
      </Show>

      {/* Edit Modal */}
      <SongFormModal
        isOpen={!!editingSong()}
        onClose={() => setEditingSong(undefined)}
        onSubmit={handleUpdate}
        song={editingSong()}
        isLoading={songs.songsResource.loading}
      />

      {/* Delete Confirmation Modal */}
      <Show when={showConfirmDelete()}>
        {song => (
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 class="text-lg font-semibold text-secondary-900 mb-2">
                楽曲を削除
              </h3>
              <p class="text-secondary-600 mb-6">
                「{song().title}
                」を削除してもよろしいですか？この操作は取り消せません。
              </p>
              <div class="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirmDelete(undefined)}
                  disabled={songs.songsResource.loading}
                >
                  キャンセル
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(song())}
                  loading={songs.songsResource.loading}
                >
                  削除する
                </Button>
              </div>
            </div>
          </div>
        )}
      </Show>
    </div>
  )
}
