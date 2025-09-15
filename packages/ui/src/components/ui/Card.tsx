import { JSX, splitProps } from 'solid-js'
import { clsx } from 'clsx'

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element
}

export function Card(props: CardProps) {
  const [local, others] = splitProps(props, ['children', 'class'])

  return (
    <div class={clsx('card', local.class)} {...others}>
      {local.children}
    </div>
  )
}

export interface CardHeaderProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element
}

export function CardHeader(props: CardHeaderProps) {
  const [local, others] = splitProps(props, ['children', 'class'])

  return (
    <div
      class={clsx('px-6 py-4 border-b border-secondary-200', local.class)}
      {...others}
    >
      {local.children}
    </div>
  )
}

export interface CardContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element
}

export function CardContent(props: CardContentProps) {
  const [local, others] = splitProps(props, ['children', 'class'])

  return (
    <div class={clsx('px-6 py-4', local.class)} {...others}>
      {local.children}
    </div>
  )
}

export interface CardFooterProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element
}

export function CardFooter(props: CardFooterProps) {
  const [local, others] = splitProps(props, ['children', 'class'])

  return (
    <div
      class={clsx(
        'px-6 py-4 border-t border-secondary-200 bg-secondary-50',
        local.class
      )}
      {...others}
    >
      {local.children}
    </div>
  )
}
