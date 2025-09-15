import { JSX, Show, splitProps, createEffect, onCleanup } from 'solid-js'
import { Portal } from 'solid-js/web'
import { clsx } from 'clsx'

export interface ModalProps {
  open: boolean
  onClose: () => void
  children: JSX.Element
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlayClick?: boolean
}

export function Modal(props: ModalProps) {
  const [local, others] = splitProps(props, [
    'open',
    'onClose',
    'children',
    'size',
    'closeOnOverlayClick',
  ])

  const size = () => local.size || 'md'
  const closeOnOverlayClick = () => local.closeOnOverlayClick ?? true

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[size()]

  // Handle escape key
  createEffect(() => {
    if (local.open) {
      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          local.onClose()
        }
      }
      document.addEventListener('keydown', handleKeydown)
      onCleanup(() => document.removeEventListener('keydown', handleKeydown))
    }
  })

  // Prevent body scroll when modal is open
  createEffect(() => {
    if (local.open) {
      document.body.style.overflow = 'hidden'
      onCleanup(() => {
        document.body.style.overflow = 'unset'
      })
    }
  })

  const handleOverlayClick = (e: MouseEvent) => {
    if (closeOnOverlayClick() && e.target === e.currentTarget) {
      local.onClose()
    }
  }

  return (
    <Show when={local.open}>
      <Portal>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in"
          onClick={handleOverlayClick}
        >
          <div
            class={clsx(
              'w-full bg-white rounded-lg shadow-xl animate-slide-up',
              sizeClass
            )}
            {...others}
          >
            {local.children}
          </div>
        </div>
      </Portal>
    </Show>
  )
}

export interface ModalHeaderProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element
  onClose?: () => void
}

export function ModalHeader(props: ModalHeaderProps) {
  const [local, others] = splitProps(props, ['children', 'onClose', 'class'])

  return (
    <div
      class={clsx(
        'flex items-center justify-between px-6 py-4 border-b border-secondary-200',
        local.class
      )}
      {...others}
    >
      <div class="flex-1">{local.children}</div>
      <Show when={local.onClose}>
        <button
          class="ml-4 text-secondary-400 hover:text-secondary-600 focus:outline-none"
          onClick={local.onClose}
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </Show>
    </div>
  )
}

export interface ModalContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element
}

export function ModalContent(props: ModalContentProps) {
  const [local, others] = splitProps(props, ['children', 'class'])

  return (
    <div class={clsx('px-6 py-4', local.class)} {...others}>
      {local.children}
    </div>
  )
}

export interface ModalFooterProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element
}

export function ModalFooter(props: ModalFooterProps) {
  const [local, others] = splitProps(props, ['children', 'class'])

  return (
    <div
      class={clsx(
        'flex justify-end gap-3 px-6 py-4 border-t border-secondary-200 bg-secondary-50',
        local.class
      )}
      {...others}
    >
      {local.children}
    </div>
  )
}
