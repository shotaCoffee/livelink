import { PageHeader, Card, CardContent, Button } from '@band-setlist/ui'
import { A } from '@solidjs/router'
import { useAuth } from '../stores/auth'

export default function HomePage() {
  const auth = useAuth()

  return (
    <div>
      <PageHeader
        title="ダッシュボード"
        subtitle={`おかえりなさい、${auth.state.user?.email}さん`}
      />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  class="w-6 h-6 text-primary-600"
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
              <h3 class="text-lg font-semibold text-secondary-900">楽曲管理</h3>
            </div>
            <p class="text-secondary-600 mb-4">
              楽曲の追加・編集・管理を行います
            </p>
            <A href="/songs">
              <Button variant="primary" size="sm">
                楽曲を管理
              </Button>
            </A>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  class="w-6 h-6 text-accent-600"
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
              <h3 class="text-lg font-semibold text-secondary-900">
                ライブ管理
              </h3>
            </div>
            <p class="text-secondary-600 mb-4">
              ライブイベントの作成・管理を行います
            </p>
            <A href="/lives">
              <Button variant="primary" size="sm">
                ライブを管理
              </Button>
            </A>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  class="w-6 h-6 text-secondary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-secondary-900">設定</h3>
            </div>
            <p class="text-secondary-600 mb-4">アカウント設定や環境設定</p>
            <A href="/settings">
              <Button variant="secondary" size="sm">
                設定を開く
              </Button>
            </A>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Section */}
      <div class="mt-8">
        <Card>
          <CardContent class="p-8 text-center">
            <h2 class="text-2xl font-bold text-secondary-900 mb-4">
              LiveLink へようこそ！
            </h2>
            <p class="text-secondary-600 mb-6 max-w-2xl mx-auto">
              LiveLink
              は、バンドのセットリスト管理を効率化するためのツールです。
              楽曲の管理、ライブイベントの作成、セットリストの共有を簡単に行うことができます。
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <A href="/songs">
                <Button variant="primary">楽曲を追加する</Button>
              </A>
              <A href="/lives">
                <Button variant="secondary">ライブを作成する</Button>
              </A>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
