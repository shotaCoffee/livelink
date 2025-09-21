import { createSignal, For, Show, createEffect } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import type { Live } from '@band-setlist/shared'
import { Card, CardContent, Button, Badge } from '@band-setlist/ui'
import { useSetlist } from '../../stores/setlists'

interface LiveListProps {
  lives: Live[]
  onEdit: (live: Live) => void
  onDelete: (id: string) => void
  loading?: boolean
}

export function LiveList(props: LiveListProps) {
  const navigate = useNavigate()
  const setlistContext = useSetlist()
  const [deleteConfirm, setDeleteConfirm] = createSignal<string | null>(null)
  const [copiedSlug, setCopiedSlug] = createSignal<string | null>(null)
  const [songCounts, setSongCounts] = createSignal<Record<string, number>>({})

  // デバッグ: livesの内容を確認
  createEffect(() => {
    console.log('LiveList props.lives:', props.lives)
    console.log('LiveList props.lives length:', props.lives.length)
    console.log('LiveList props.lives JSON:', JSON.stringify(props.lives))
  })

  // 個別の楽曲数を取得する関数
  const loadSongCount = async (liveId: string) => {
    try {
      const currentCounts = songCounts()
      if (currentCounts[liveId] !== undefined) {
        return currentCounts[liveId] // 既にロード済み
      }

      const currentLiveId = setlistContext.currentLiveId()
      setlistContext.setCurrentLiveId(liveId)
      await setlistContext.refreshSetlist()
      const setlistItems = setlistContext.setlistResource() || []
      const count = setlistItems.length

      // 元のLiveIDに戻す
      if (currentLiveId) {
        setlistContext.setCurrentLiveId(currentLiveId)
      }

      // カウントを更新
      setSongCounts(prev => ({ ...prev, [liveId]: count }))
      return count
    } catch (error) {
      console.error(`Error loading setlist for live ${liveId}:`, error)
      setSongCounts(prev => ({ ...prev, [liveId]: 0 }))
      return 0
    }
  }

  // 楽曲数を取得するヘルパー関数
  const getSongCount = (liveId: string) => {
    return songCounts()[liveId] || 0
  }

  // 楽曲数バッジコンポーネント
  function SongCountBadge(props: { liveId: string }) {
    const [isLoading, setIsLoading] = createSignal(false)
    const count = () => getSongCount(props.liveId)
    const hasLoaded = () => songCounts()[props.liveId] !== undefined

    // コンポーネントマウント時に楽曲数を読み込み
    createEffect(() => {
      if (!hasLoaded() && !isLoading()) {
        setIsLoading(true)
        loadSongCount(props.liveId).finally(() => {
          setIsLoading(false)
        })
      }
    })

    return (
      <Badge variant="secondary" class="flex items-center gap-1">
        <svg
          class="w-3 h-3"
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
        <Show when={!isLoading()} fallback={<span class="text-xs">...</span>}>
          {count()}曲
        </Show>
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })
  }

  const handleDelete = (id: string) => {
    if (deleteConfirm() === id) {
      props.onDelete(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => {
        if (deleteConfirm() === id) {
          setDeleteConfirm(null)
        }
      }, 3000)
    }
  }

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date()
  }

  const copyShareUrl = async (shareSlug: string) => {
    const fullUrl = `${window.location.origin}/share/${shareSlug}`
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopiedSlug(shareSlug)
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedSlug(null), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = fullUrl
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopiedSlug(shareSlug)
        setTimeout(() => setCopiedSlug(null), 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy also failed:', fallbackErr)
      } finally {
        document.body.removeChild(textArea)
      }
    }
  }

  return (
    <div class="space-y-4">
      <Show when={props.lives.length === 0}>
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-secondary-900 mb-2">
              ライブイベントがまだありません
            </h3>
            <p class="text-secondary-600">
              最初のライブイベントを作成して、セットリストの管理を始めましょう。
            </p>
          </CardContent>
        </Card>
      </Show>

      <For each={props.lives}>
        {live => (
          <Card>
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-xl font-bold text-secondary-900">
                      {live.name}
                    </h3>
                    <Badge variant={live.is_upcoming ? 'primary' : 'secondary'}>
                      {live.is_upcoming ? '開催予定' : '開催済み'}
                    </Badge>
                    <SongCountBadge liveId={live.id} />
                    <Show when={isUpcoming(live.date) && !live.is_upcoming}>
                      <Badge variant="warning">日付更新が必要</Badge>
                    </Show>
                  </div>

                  <div class="space-y-2 text-secondary-600">
                    <div class="flex items-center gap-2">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{live.venue}</span>
                    </div>

                    <div class="flex items-center gap-2">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{formatDate(live.date)}</span>
                    </div>

                    <Show when={live.description}>
                      <p class="text-sm mt-3 bg-secondary-50 p-3 rounded-lg">
                        {live.description}
                      </p>
                    </Show>

                    <Show when={live.share_slug}>
                      <div class="flex items-center gap-2 text-sm">
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
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.1a4 4 0 00-2.124-6.82c-.304-.077-.619-.084-.924-.08M12 8c-.304-.077-.619-.084-.924-.08a4 4 0 00-2.124 6.82l1.102 1.1a4 4 0 105.656-5.656l-4-4z"
                          />
                        </svg>
                        <span class="text-primary-600">
                          公開URL: /share/{live.share_slug}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => copyShareUrl(live.share_slug!)}
                          disabled={props.loading}
                          class="!p-1 !h-6 ml-2"
                        >
                          <Show
                            when={copiedSlug() === live.share_slug}
                            fallback={
                              <>
                                <svg
                                  class="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                                <span class="ml-1 text-xs">コピー</span>
                              </>
                            }
                          >
                            <>
                              <svg
                                class="w-3 h-3 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span class="ml-1 text-xs text-green-600">
                                コピー済み
                              </span>
                            </>
                          </Show>
                        </Button>
                      </div>
                    </Show>
                  </div>
                </div>

                <div class="flex flex-col gap-2 ml-4">
                  <Show when={live.share_slug}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        window.open(`/share/${live.share_slug}`, '_blank')
                      }
                      disabled={props.loading}
                      class="flex items-center gap-2"
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      公開ページ
                    </Button>
                  </Show>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => props.onEdit(live)}
                    disabled={props.loading}
                  >
                    編集
                  </Button>

                  <Button
                    variant={
                      deleteConfirm() === live.id ? 'danger' : 'secondary'
                    }
                    size="sm"
                    onClick={() => handleDelete(live.id)}
                    disabled={props.loading}
                  >
                    {deleteConfirm() === live.id ? '本当に削除？' : '削除'}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/setlist/${live.id}`)}
                    disabled={props.loading}
                  >
                    セットリスト
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </For>
    </div>
  )
}
