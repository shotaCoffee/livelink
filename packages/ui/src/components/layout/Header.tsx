import { JSX, splitProps } from 'solid-js'
import { clsx } from 'clsx'

export interface HeaderProps extends JSX.HTMLAttributes<HTMLElement> {
  children: JSX.Element
}

export function Header(props: HeaderProps) {
  const [local, others] = splitProps(props, ['children', 'class'])

  return (
    <header
      class={clsx(
        'bg-white border-b border-secondary-200 shadow-sm',
        local.class
      )}
      {...others}
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          {local.children}
        </div>
      </div>
    </header>
  )
}

export interface HeaderBrandProps {
  title: string
  subtitle?: string
  logo?: JSX.Element
}

export function HeaderBrand(props: HeaderBrandProps) {
  return (
    <div class="flex items-center gap-3">
      {props.logo}
      <div>
        <h1 class="text-xl font-bold text-secondary-900">{props.title}</h1>
        {props.subtitle && (
          <p class="text-sm text-secondary-500">{props.subtitle}</p>
        )}
      </div>
    </div>
  )
}

export interface HeaderActionsProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element
}

export function HeaderActions(props: HeaderActionsProps) {
  const [local, others] = splitProps(props, ['children', 'class'])

  return (
    <div class={clsx('flex items-center gap-3', local.class)} {...others}>
      {local.children}
    </div>
  )
}
