import { JSX, splitProps, mergeProps } from 'solid-js'
import { clsx } from 'clsx'

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  helperText?: string
}

export function Input(props: InputProps) {
  const merged = mergeProps({ error: false }, props)
  const [local, others] = splitProps(merged, ['error', 'helperText', 'class'])

  return (
    <div class="w-full">
      <input
        class={clsx(
          'input-base',
          local.error &&
            'border-accent-500 focus:border-accent-500 focus:ring-accent-500',
          local.class
        )}
        {...others}
      />
      {local.helperText && (
        <p
          class={clsx(
            'mt-1 text-sm',
            local.error ? 'text-accent-600' : 'text-secondary-500'
          )}
        >
          {local.helperText}
        </p>
      )}
    </div>
  )
}
