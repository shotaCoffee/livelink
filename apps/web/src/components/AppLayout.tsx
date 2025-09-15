import { JSX, createSignal } from 'solid-js'
import { useLocation } from '@solidjs/router'
import {
  AppLayout as UIAppLayout,
  Header,
  HeaderBrand,
  HeaderActions,
  Sidebar,
  SidebarNavigation,
  Button,
} from '@band-setlist/ui'
import type { NavigationItem } from '@band-setlist/ui'
import { useAuth } from '../stores/auth'

interface AppLayoutProps {
  children: JSX.Element
}

export default function AppLayout(props: AppLayoutProps) {
  const auth = useAuth()
  const location = useLocation()
  const [sidebarCollapsed] = createSignal(false)

  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'ホーム',
      href: '/',
      active: location.pathname === '/',
      icon: (
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      id: 'songs',
      label: '楽曲管理',
      href: '/songs',
      active: location.pathname.startsWith('/songs'),
      icon: (
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
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      ),
    },
    {
      id: 'lives',
      label: 'ライブ管理',
      href: '/lives',
      active: location.pathname.startsWith('/lives'),
      icon: (
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: '設定',
      href: '/settings',
      active: location.pathname.startsWith('/settings'),
      icon: (
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ]

  const handleSignOut = async () => {
    await auth.signOut()
  }

  const header = (
    <Header>
      <HeaderBrand
        title="LiveLink"
        subtitle="セットリスト管理"
        logo={
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg
              class="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        }
      />
      <HeaderActions>
        <span class="text-sm text-secondary-600">{auth.state.user?.email}</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSignOut}
          loading={auth.state.loading}
        >
          ログアウト
        </Button>
      </HeaderActions>
    </Header>
  )

  const sidebar = (
    <Sidebar collapsed={sidebarCollapsed()}>
      <div class="p-4">
        <SidebarNavigation
          items={navigationItems}
          collapsed={sidebarCollapsed()}
        />
      </div>
    </Sidebar>
  )

  return (
    <UIAppLayout header={header} sidebar={sidebar} sidebarCollapsible={true}>
      {props.children}
    </UIAppLayout>
  )
}
