import { JSX, ParentComponent } from 'solid-js'

export interface BadgeProps {
  /**
   * Visual variant of the badge
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  /**
   * Size of the badge
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Additional CSS classes to apply to the badge
   */
  class?: string
  /**
   * Badge content
   */
  children: JSX.Element
}

/**
 * Badge component for displaying status, labels, or counts
 *
 * @param props - The badge props
 * @returns JSX element
 */
export const Badge: ParentComponent<BadgeProps> = props => {
  const variantClasses = () => {
    switch (props.variant) {
      case 'primary':
        return 'bg-primary-100 text-primary-800 border-primary-200'
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'secondary':
      default:
        return 'bg-secondary-100 text-secondary-800 border-secondary-200'
    }
  }

  const sizeClasses = () => {
    switch (props.size) {
      case 'sm':
        return 'text-xs px-2 py-0.5'
      case 'lg':
        return 'text-sm px-3 py-1'
      case 'md':
      default:
        return 'text-xs px-2.5 py-0.5'
    }
  }

  const baseClasses = 'inline-flex items-center font-medium rounded-full border'

  return (
    <span
      class={`${baseClasses} ${variantClasses()} ${sizeClasses()} ${props.class || ''}`}
    >
      {props.children}
    </span>
  )
}
