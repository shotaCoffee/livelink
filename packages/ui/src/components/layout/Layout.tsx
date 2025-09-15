import { JSX, splitProps, createSignal } from 'solid-js'
import { clsx } from 'clsx'

export interface LayoutProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element
}

export function Layout(props: LayoutProps) {
  const [local, others] = splitProps(props, ['children', 'class'])

  return (
    <div class={clsx('min-h-screen bg-secondary-50', local.class)} {...others}>
      {local.children}
    </div>
  )
}

export interface AppLayoutProps {
  header: JSX.Element
  sidebar?: JSX.Element
  children: JSX.Element
  sidebarCollapsible?: boolean
}

export function AppLayout(props: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = createSignal(false)

  const toggleSidebar = () => {
    if (props.sidebarCollapsible) {
      setSidebarCollapsed(!sidebarCollapsed())
    }
  }

  return (
    <Layout>
      <div class="flex flex-col h-screen">
        {/* Header */}
        <div class="flex-shrink-0">{props.header}</div>

        {/* Main content area */}
        <div class="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          {props.sidebar && <div class="flex-shrink-0">{props.sidebar}</div>}

          {/* Main content */}
          <main class="flex-1 overflow-auto">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {props.children}
            </div>
          </main>
        </div>
      </div>

      {/* Sidebar toggle button for mobile */}
      {props.sidebarCollapsible && (
        <button
          class="fixed bottom-4 left-4 z-50 lg:hidden bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={toggleSidebar}
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d={
                sidebarCollapsed()
                  ? 'M4 6h16M4 12h16M4 18h16'
                  : 'M6 18L18 6M6 6l12 12'
              }
            />
          </svg>
        </button>
      )}
    </Layout>
  )
}

export interface PageHeaderProps extends JSX.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  actions?: JSX.Element
  breadcrumbs?: JSX.Element
}

export function PageHeader(props: PageHeaderProps) {
  const [local, others] = splitProps(props, [
    'title',
    'subtitle',
    'actions',
    'breadcrumbs',
    'class',
  ])

  return (
    <div class={clsx('mb-8', local.class)} {...others}>
      {local.breadcrumbs && <div class="mb-4">{local.breadcrumbs}</div>}

      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-secondary-900">{local.title}</h1>
          {local.subtitle && (
            <p class="mt-1 text-secondary-600">{local.subtitle}</p>
          )}
        </div>

        {local.actions && (
          <div class="flex items-center gap-3">{local.actions}</div>
        )}
      </div>
    </div>
  )
}

export interface ContainerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Container(props: ContainerProps) {
  const [local, others] = splitProps(props, ['children', 'size', 'class'])

  const sizeClass = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }[local.size || 'xl']

  return (
    <div
      class={clsx('mx-auto px-4 sm:px-6 lg:px-8', sizeClass, local.class)}
      {...others}
    >
      {local.children}
    </div>
  )
}
