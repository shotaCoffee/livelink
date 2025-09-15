import { JSX, splitProps } from 'solid-js'

export interface TextareaProps
  extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Additional CSS classes to apply to the textarea
   */
  class?: string
  /**
   * Whether the textarea has an error state
   */
  error?: boolean
  /**
   * Whether the textarea is disabled
   */
  disabled?: boolean
}

/**
 * Textarea component for multi-line text input
 *
 * @param props - The textarea props
 * @returns JSX element
 */
export function Textarea(props: TextareaProps) {
  const [local, others] = splitProps(props, ['class', 'error', 'disabled'])

  const baseClasses =
    'w-full px-3 py-2 border rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 resize-y'
  const stateClasses = () => {
    if (local.disabled) {
      return 'bg-secondary-50 border-secondary-200 text-secondary-500 cursor-not-allowed'
    }
    if (local.error) {
      return 'border-red-300 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-25'
    }
    return 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500 focus:ring-opacity-25 hover:border-secondary-400'
  }

  const classes = () => `${baseClasses} ${stateClasses()} ${local.class || ''}`

  return <textarea class={classes()} disabled={local.disabled} {...others} />
}
