import { JSX, splitProps, For, Show } from 'solid-js'
import { clsx } from 'clsx'

export interface SidebarProps extends JSX.HTMLAttributes<HTMLElement> {
  children: JSX.Element
  collapsed?: boolean
}

export function Sidebar(props: SidebarProps) {
  const [local, others] = splitProps(props, ['children', 'class', 'collapsed'])

  return (
    <aside
      class={clsx(
        'bg-white border-r border-secondary-200 transition-all duration-300',
        local.collapsed ? 'w-16' : 'w-64',
        local.class
      )}
      {...others}
    >
      {local.children}
    </aside>
  )
}

export interface NavigationItem {
  id: string
  label: string
  icon?: JSX.Element
  href?: string
  onClick?: () => void
  active?: boolean
  badge?: string | number
}

export interface SidebarNavigationProps {
  items: NavigationItem[]
  collapsed?: boolean
}

export function SidebarNavigation(props: SidebarNavigationProps) {
  return (
    <nav class="p-4">
      <ul class="space-y-2">
        <For each={props.items}>
          {item => (
            <li>
              <SidebarNavigationItem item={item} collapsed={props.collapsed} />
            </li>
          )}
        </For>
      </ul>
    </nav>
  )
}

interface SidebarNavigationItemProps {
  item: NavigationItem
  collapsed?: boolean
}

function SidebarNavigationItem(props: SidebarNavigationItemProps) {
  const handleClick = (e: Event) => {
    if (props.item.onClick) {
      e.preventDefault()
      props.item.onClick()
    }
  }

  const baseClass = clsx(
    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
    'hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500',
    props.item.active
      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
      : 'text-secondary-600 hover:text-secondary-900'
  )

  const content = (
    <>
      <Show when={props.item.icon}>
        <span class="flex-shrink-0 w-5 h-5">{props.item.icon}</span>
      </Show>
      <Show when={!props.collapsed}>
        <span class="flex-1 truncate">{props.item.label}</span>
        <Show when={props.item.badge}>
          <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full">
            {props.item.badge}
          </span>
        </Show>
      </Show>
    </>
  )

  return (
    <Show
      when={props.item.href}
      fallback={
        <button class={baseClass} onClick={handleClick}>
          {content}
        </button>
      }
    >
      <a href={props.item.href} class={baseClass} onClick={handleClick}>
        {content}
      </a>
    </Show>
  )
}

export interface SidebarSectionProps {
  title?: string
  children: JSX.Element
  collapsed?: boolean
}

export function SidebarSection(props: SidebarSectionProps) {
  return (
    <div class="mb-6">
      <Show when={props.title && !props.collapsed}>
        <h3 class="px-3 mb-2 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
          {props.title}
        </h3>
      </Show>
      {props.children}
    </div>
  )
}
