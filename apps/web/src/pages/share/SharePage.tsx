import {
  Show,
  For,
  ErrorBoundary,
  Suspense,
  onMount,
  createSignal,
  createEffect,
} from 'solid-js'
import { useParams } from '@solidjs/router'
import {
  Card,
  CardContent,
  LoadingSpinner,
  ErrorBanner,
  Badge,
} from '@band-setlist/ui'
import { useLives } from '../../stores/lives'
import { useSetlist } from '../../stores/setlists'
import type { Live } from '@band-setlist/shared'

function SharePageContent() {
  const params = useParams()
  const livesContext = useLives()
  const setlistContext = useSetlist()

  const [currentLive, setCurrentLive] = createSignal<Live | null>(null)

  // URLパラメータからshare_slugを取得
  const shareSlug = () => params.slug

  // コンポーネントマウント時にライブリソースの取得を開始
  onMount(() => {
    const slug = shareSlug()
    console.log('SharePage: Loading live by slug:', slug)
    console.log('SharePage: Environment debug:', {
      supabaseUrl: import.meta.env?.VITE_SUPABASE_URL,
      isLocalSupabase: import.meta.env?.VITE_SUPABASE_URL?.includes(
        'localhost:54321'
      ),
      isPlaceholder: import.meta.env?.VITE_SUPABASE_URL?.includes(
        'placeholder'
      ),
    })

    // livesResourceがまだ読み込まれていない場合のみrefreshを呼ぶ
    const lives = livesContext.livesResource()
    console.log('SharePage: Initial lives resource:', lives)

    if (!lives && !livesContext.livesResource.loading) {
      console.log('SharePage: Refreshing lives...')
      livesContext.refreshLives()
    }
  })

  // livesResourceの変更をリアクティブに監視
  createEffect(() => {
    const slug = shareSlug()
    const lives = livesContext.livesResource()

    console.log('SharePage: Lives resource updated:', lives)

    if (lives) {
      console.log(
        'SharePage: Available lives:',
        lives.map(live => ({
          id: live.id,
          title: live.title,
          share_slug: live.share_slug,
        }))
      )

      // share_slugに一致するライブを検索
      const matchedLive = lives.find(live => live.share_slug === slug)
      console.log('SharePage: Found live:', matchedLive)

      if (matchedLive) {
        setCurrentLive(matchedLive)
        // セットリストのliveIdを設定（これによりsetlistResourceが自動的に更新される）
        console.log('SharePage: Setting live ID:', matchedLive.id)
        setlistContext.setCurrentLiveId(matchedLive.id)
      } else {
        console.warn('SharePage: No live found with slug:', slug)
        console.warn(
          'SharePage: Available slugs:',
          lives.map(live => live.share_slug)
        )
      }
    }
  })

  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  const setlistItems = () => {
    const items = setlistContext.setlistResource() || []
    console.log('SharePage: setlistItems:', items)
    console.log('SharePage: setlistItems length:', items.length)
    return items
  }

  return (
    <div class="min-h-screen bg-secondary-50">
      <div class="max-w-4xl mx-auto px-4 py-8">
        <Show when={livesContext.livesResource.error}>
          <ErrorBanner message="ライブ情報の読み込みに失敗しました。" />
        </Show>

        <Show when={setlistContext.setlistResource.error}>
          <ErrorBanner message="セットリストの読み込みに失敗しました。" />
        </Show>

        <Show when={!currentLive() && !livesContext.livesResource.loading}>
          <Card>
            <CardContent class="p-8 text-center">
              <div class="w-16 h-16 bg-secondary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  class="w-8 h-8 text-secondary-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.239 0-4.236-.908-5.69-2.376"
                  />
                </svg>
              </div>
              <h1 class="text-2xl font-bold text-secondary-900 mb-2">
                ページが見つかりません
              </h1>
              <p class="text-secondary-600">
                指定されたセットリストは存在しないか、公開されていません。
              </p>
            </CardContent>
          </Card>
        </Show>

        <Show when={currentLive()}>
          {live => (
            <>
              {/* ヘッダー */}
              <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-secondary-900 mb-2">
                  {live().title}
                </h1>
                <div class="flex items-center justify-center space-x-4 text-secondary-600 mb-4">
                  <div class="flex items-center space-x-2">
                    <svg
                      class="w-5 h-5"
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
                    <span class="text-lg">{live().venue}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <svg
                      class="w-5 h-5"
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
                    <span class="text-lg">{formatDate(live().date)}</span>
                  </div>
                </div>

                <div class="flex justify-center space-x-2 mb-6">
                  <Badge
                    variant={isUpcoming(live().date) ? 'primary' : 'secondary'}
                    class="text-sm px-3 py-1"
                  >
                    {isUpcoming(live().date) ? '開催予定' : '開催済み'}
                  </Badge>
                  <Show when={setlistItems().length > 0}>
                    <Badge variant="secondary" class="text-sm px-3 py-1">
                      {setlistItems().length}曲
                    </Badge>
                  </Show>
                </div>

                <Show when={live().description}>
                  <p class="text-secondary-700 text-lg max-w-2xl mx-auto bg-white p-4 rounded-lg shadow-sm">
                    {live().description}
                  </p>
                </Show>
              </div>

              {/* セットリスト */}
              <Card>
                <CardContent class="p-6">
                  <h2 class="text-2xl font-bold text-secondary-900 mb-6 flex items-center">
                    <svg
                      class="w-6 h-6 mr-3 text-primary-600"
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
                    セットリスト
                  </h2>

                  <Show
                    when={setlistItems().length > 0}
                    fallback={
                      <div class="text-center py-12">
                        <div class="w-16 h-16 bg-secondary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg
                            class="w-8 h-8 text-secondary-500"
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
                          セットリストが未公開です
                        </h3>
                        <p class="text-secondary-600">
                          このライブのセットリストはまだ公開されていません。
                        </p>
                      </div>
                    }
                  >
                    <div class="space-y-4">
                      <For
                        each={setlistItems().sort(
                          (a, b) => a.order_index - b.order_index
                        )}
                      >
                        {item => (
                          <div class="flex items-center space-x-4 p-4 bg-secondary-50 rounded-lg">
                            <div class="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full text-sm font-bold flex-shrink-0">
                              {item.order_index}
                            </div>
                            <div class="flex-1">
                              <h3 class="font-semibold text-secondary-900 text-lg">
                                {item.songs?.title}
                              </h3>
                              <p class="text-secondary-600">
                                {item.songs?.artist}
                              </p>
                            </div>
                            <div class="flex space-x-3">
                              <Show when={item.songs?.youtube_url}>
                                <a
                                  href={item.songs!.youtube_url!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  class="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
                                >
                                  <svg
                                    class="w-4 h-4 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                  </svg>
                                  YouTube
                                </a>
                              </Show>
                              <Show when={item.songs?.spotify_url}>
                                <a
                                  href={item.songs!.spotify_url!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  class="inline-flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm font-medium"
                                >
                                  <svg
                                    class="w-4 h-4 mr-2"
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
                        )}
                      </For>
                    </div>
                  </Show>
                </CardContent>
              </Card>

              {/* フッター */}
              <div class="text-center mt-8 text-sm text-secondary-500">
                <p>Powered by LiveLink</p>
              </div>
            </>
          )}
        </Show>

        {/* ローディング状態 */}
        <Show
          when={
            livesContext.livesResource.loading ||
            setlistContext.setlistResource.loading
          }
        >
          <div class="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        </Show>
      </div>
    </div>
  )
}

export default function SharePage() {
  return (
    <ErrorBoundary
      fallback={err => <div class="text-red-600">エラー: {err.message}</div>}
    >
      <Suspense
        fallback={
          <div class="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        }
      >
        <SharePageContent />
      </Suspense>
    </ErrorBoundary>
  )
}
