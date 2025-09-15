import { createSignal, createEffect, Show, For } from 'solid-js'
import { useParams, useNavigate } from '@solidjs/router'
import {
  PageHeader,
  Button,
  Card,
  CardContent,
  LoadingSpinner,
  ErrorBanner,
  Badge,
} from '@band-setlist/ui'
import { useSetlist } from '../../stores/setlists'
import { useSongs } from '../../stores/songs'
import { useLives } from '../../stores/lives'
import type { Song, SetlistItem } from '@band-setlist/shared'

// セットリスト項目の拖拽可能なコンポーネント
function SetlistItemCard(props: {
  item: SetlistItem
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  isFirst: boolean
  isLast: boolean
  isLoading: boolean
}) {
  return (
    <Card>
      <CardContent class="p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4 flex-1">
            <div class="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">
              {props.item.order_index}
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-secondary-900">
                {props.item.songs?.title ||
                  `楽曲ID: ${props.item.song_id} (情報取得中)`}
              </h3>
              <p class="text-sm text-secondary-600">
                {props.item.songs?.artist || 'アーティスト情報なし'}
              </p>
              <div class="flex space-x-3 mt-2">
                <Show when={props.item.songs?.youtube_url}>
                  <a
                    href={props.item.songs!.youtube_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs font-medium"
                  >
                    <svg
                      class="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    YouTube
                  </a>
                </Show>
                <Show when={props.item.songs?.spotify_url}>
                  <a
                    href={props.item.songs!.spotify_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs font-medium"
                  >
                    <svg
                      class="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                    Spotify
                  </a>
                </Show>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={props.onMoveUp}
              disabled={props.isFirst || props.isLoading}
              class="!p-2"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={props.onMoveDown}
              disabled={props.isLast || props.isLoading}
              class="!p-2"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={props.onRemove}
              disabled={props.isLoading}
              class="!p-2"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 楽曲選択モーダル
function AddSongModal(props: {
  isOpen: boolean
  onClose: () => void
  onAddSong: (songId: string) => Promise<boolean>
  availableSongs: Song[]
  isLoading: boolean
  onRefreshSongs: () => void
}) {
  const [selectedSong, setSelectedSong] = createSignal<string>('')
  const [searchQuery, setSearchQuery] = createSignal('')

  // モーダルが開かれた時に楽曲リストを更新
  createEffect(() => {
    if (props.isOpen) {
      console.log('AddSongModal opened, refreshing songs...')
      props.onRefreshSongs()
    }
  })

  // フィルタリングされた楽曲リスト
  const filteredSongs = () => {
    const query = searchQuery().toLowerCase()
    return props.availableSongs.filter(
      song =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    )
  }

  const handleAddSong = async () => {
    const songId = selectedSong()
    if (!songId) return

    const success = await props.onAddSong(songId)
    if (success) {
      setSelectedSong('')
      setSearchQuery('')
      props.onClose()
    }
  }

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-secondary-900">楽曲を追加</h2>
            <Button variant="secondary" onClick={props.onClose} class="!p-2">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>

          {/* 検索とリフレッシュ */}
          <div class="mb-4 flex space-x-2">
            <input
              type="text"
              placeholder="楽曲を検索..."
              value={searchQuery()}
              onInput={e => setSearchQuery(e.currentTarget.value)}
              class="flex-1 px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Button
              variant="secondary"
              onClick={() => {
                console.log('Manual refresh triggered')
                props.onRefreshSongs()
              }}
              class="!p-2"
              title="楽曲リストを更新"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </Button>
          </div>

          {/* 楽曲リスト */}
          <div class="flex-1 overflow-y-auto mb-6">
            <div class="space-y-2">
              <For each={filteredSongs()}>
                {song => (
                  <div
                    class={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedSong() === song.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                    onClick={() => setSelectedSong(song.id)}
                  >
                    <div class="font-medium text-secondary-900">
                      {song.title}
                    </div>
                    <div class="text-sm text-secondary-600">{song.artist}</div>
                  </div>
                )}
              </For>
              <Show when={filteredSongs().length === 0}>
                <div class="text-center text-secondary-500 py-8">
                  <Show when={searchQuery()}>
                    <div>
                      <p>検索結果が見つかりません</p>
                      <p class="text-xs mt-2">
                        検索条件を変更するか、リフレッシュボタンを試してください
                      </p>
                    </div>
                  </Show>
                  <Show when={!searchQuery()}>
                    <div>
                      <p>利用可能な楽曲がありません</p>
                      <p class="text-xs mt-2">
                        楽曲管理で楽曲を追加するか、リフレッシュボタンを試してください
                      </p>
                    </div>
                  </Show>
                </div>
              </Show>
            </div>
          </div>

          {/* ボタン */}
          <div class="flex justify-end space-x-3">
            <Button variant="secondary" onClick={props.onClose}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              onClick={handleAddSong}
              disabled={!selectedSong() || props.isLoading}
              loading={props.isLoading}
            >
              追加
            </Button>
          </div>
        </div>
      </div>
    </Show>
  )
}

function SetlistPageContent() {
  const params = useParams()
  const navigate = useNavigate()
  const setlistContext = useSetlist()
  const songsContext = useSongs()
  const livesContext = useLives()

  const [showAddModal, setShowAddModal] = createSignal(false)

  // URLパラメータからライブIDを取得
  const liveId = () => params.liveId

  // createResourceが自動的にデータを読み込むため、手動リフレッシュは不要

  // ライブIDが変更されたらセットリストを読み込み
  createEffect(() => {
    const id = liveId()
    if (id) {
      console.log('SetlistPage: Setting live ID:', id)
      setlistContext.setCurrentLiveId(id)
    } else {
      // ライブIDがない場合はライブページにリダイレクト
      navigate('/lives')
    }
  })

  // 現在のライブ情報を取得
  const currentLive = () => {
    const lives = livesContext.livesResource()
    const id = liveId()
    return lives?.find(live => live.id === id)
  }

  // 利用可能な楽曲（まだセットリストに含まれていない楽曲）を取得
  const availableSongs = () => {
    const allSongs = songsContext.songsResource() || []
    const setlistItems = setlistContext.setlistResource() || []
    const usedSongIds = new Set(setlistItems.map(item => item.song_id))

    return allSongs.filter(song => !usedSongIds.has(song.id))
  }

  const handleMoveUp = async (item: SetlistItem) => {
    if (item.order_index <= 1) return
    await setlistContext.updateOrder(item.id, item.order_index - 1)
  }

  const handleMoveDown = async (item: SetlistItem) => {
    const items = setlistContext.setlistResource() || []
    const maxOrder = Math.max(...items.map(i => i.order_index))
    if (item.order_index >= maxOrder) return
    await setlistContext.updateOrder(item.id, item.order_index + 1)
  }

  const handleRemove = async (item: SetlistItem) => {
    await setlistContext.removeSong(item.id)
  }

  const handleAddSong = async (songId: string) => {
    const id = liveId()
    if (!id) return false
    return await setlistContext.addSong(id, songId)
  }

  const handleClearSetlist = async () => {
    const id = liveId()
    if (!id) return
    if (
      confirm('セットリストをすべてクリアしますか？この操作は取り消せません。')
    ) {
      await setlistContext.clearSetlist(id)
    }
  }

  return (
    <Show when={liveId()} fallback={<div>Loading...</div>}>
      <SetlistPageMainContent
        liveId={liveId()!}
        currentLive={currentLive}
        setlistContext={setlistContext}
        songsContext={songsContext}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        handleAddSong={handleAddSong}
        handleClearSetlist={handleClearSetlist}
        handleMoveUp={handleMoveUp}
        handleMoveDown={handleMoveDown}
        handleRemove={handleRemove}
        availableSongs={availableSongs}
      />
    </Show>
  )
}

function SetlistPageMainContent(props: {
  liveId: string
  currentLive: () => any
  setlistContext: any
  songsContext: any
  showAddModal: () => boolean
  setShowAddModal: (show: boolean) => void
  handleAddSong: (songId: string) => Promise<boolean>
  handleClearSetlist: () => Promise<void>
  handleMoveUp: (item: SetlistItem) => Promise<void>
  handleMoveDown: (item: SetlistItem) => Promise<void>
  handleRemove: (item: SetlistItem) => Promise<void>
  availableSongs: () => any[]
}) {
  const setlistItems = () => props.setlistContext.setlistResource() || []
  const live = props.currentLive()

  return (
    <div>
      <PageHeader
        title={live ? `${live.title} - セットリスト` : 'セットリスト'}
        subtitle={
          live
            ? `${live.venue} | ${new Date(live.date).toLocaleDateString('ja-JP')}`
            : undefined
        }
        actions={
          <div class="flex space-x-2">
            <Button
              variant="secondary"
              onClick={props.handleClearSetlist}
              disabled={
                setlistItems().length === 0 ||
                props.setlistContext.setlistResource.loading
              }
            >
              すべてクリア
            </Button>
            <Button
              variant="primary"
              onClick={() => props.setShowAddModal(true)}
              disabled={
                props.availableSongs().length === 0 ||
                props.setlistContext.setlistResource.loading
              }
            >
              楽曲を追加
            </Button>
          </div>
        }
      />

      {/* エラー表示 */}
      <Show when={props.setlistContext.setlistResource.error}>
        <ErrorBanner
          message={props.setlistContext.setlistResource.error!.message}
        />
      </Show>

      {/* ローディング表示またはSetlist */}
      <Show
        when={props.setlistContext.setlistResource.loading}
        fallback={
          <div class="space-y-4">
            <Show when={setlistItems().length === 0}>
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
                    セットリストが空です
                  </h3>
                  <p class="text-secondary-600 mb-4">
                    楽曲を追加してセットリストを作成しましょう。
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => props.setShowAddModal(true)}
                    disabled={props.availableSongs().length === 0}
                  >
                    最初の楽曲を追加
                  </Button>
                  <Show when={props.availableSongs().length === 0}>
                    <p class="text-sm text-secondary-500 mt-2">
                      まず楽曲管理で楽曲を登録してください。
                    </p>
                  </Show>
                </CardContent>
              </Card>
            </Show>

            <For
              each={setlistItems().sort(
                (a: SetlistItem, b: SetlistItem) =>
                  a.order_index - b.order_index
              )}
            >
              {(item, index) => (
                <SetlistItemCard
                  item={item}
                  onMoveUp={() => props.handleMoveUp(item)}
                  onMoveDown={() => props.handleMoveDown(item)}
                  onRemove={() => props.handleRemove(item)}
                  isFirst={index() === 0}
                  isLast={index() === setlistItems().length - 1}
                  isLoading={props.setlistContext.setlistResource.loading}
                />
              )}
            </For>

            <Show when={setlistItems().length > 0}>
              <Card>
                <CardContent class="p-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <Badge variant="secondary">
                        合計: {setlistItems().length}曲
                      </Badge>
                      <Show when={live?.share_slug}>
                        <Badge variant="primary">公開中</Badge>
                      </Show>
                    </div>
                    <Show when={live?.share_slug}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          window.open(`/share/${live!.share_slug}`, '_blank')
                        }
                      >
                        公開ページを見る
                      </Button>
                    </Show>
                  </div>
                </CardContent>
              </Card>
            </Show>
          </div>
        }
      >
        <div class="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </Show>

      {/* 楽曲追加モーダル */}
      <AddSongModal
        isOpen={props.showAddModal()}
        onClose={() => props.setShowAddModal(false)}
        onAddSong={props.handleAddSong}
        availableSongs={props.availableSongs()}
        isLoading={props.setlistContext.setlistResource.loading}
        onRefreshSongs={props.songsContext.refreshSongs}
      />
    </div>
  )
}

export default function SetlistPage() {
  return <SetlistPageContent />
}
