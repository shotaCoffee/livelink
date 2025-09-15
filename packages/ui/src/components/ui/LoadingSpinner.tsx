export interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Additional CSS classes to apply to the spinner
   */
  class?: string
  /**
   * Optional loading text to display below the spinner
   */
  text?: string
}

/**
 * Loading spinner component for indicating loading states
 *
 * @param props - The loading spinner props
 * @returns JSX element
 */
export function LoadingSpinner(props: LoadingSpinnerProps) {
  const sizeClasses = () => {
    switch (props.size) {
      case 'sm':
        return 'w-4 h-4'
      case 'lg':
        return 'w-8 h-8'
      case 'md':
      default:
        return 'w-6 h-6'
    }
  }

  return (
    <div
      class={`flex flex-col items-center justify-center ${props.class || ''}`}
    >
      <div
        class={`animate-spin rounded-full border-2 border-secondary-300 border-t-primary-600 ${sizeClasses()}`}
        role="status"
        aria-label="読み込み中"
      />
      {props.text && (
        <span class="mt-2 text-sm text-secondary-600">{props.text}</span>
      )}
    </div>
  )
}
