import { JSX, splitProps, mergeProps } from 'solid-js'
import { clsx } from 'clsx'

export interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: JSX.Element
}

export function Button(props: ButtonProps) {
  const merged = mergeProps(
    { variant: 'primary' as const, size: 'md' as const, loading: false },
    props
  )

  const [local, others] = splitProps(merged, [
    'variant',
    'size',
    'loading',
    'children',
    'class',
    'disabled',
  ])

  const baseClass = 'btn-base'
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  }[local.variant]

  const sizeClass = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }[local.size]

  return (
    <button
      class={clsx(
        baseClass,
        variantClass,
        sizeClass,
        local.loading && 'opacity-75 cursor-not-allowed',
        local.class
      )}
      disabled={local.disabled || local.loading}
      {...others}
    >
      {local.loading && (
        <svg
          class="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {local.children}
    </button>
  )
}
