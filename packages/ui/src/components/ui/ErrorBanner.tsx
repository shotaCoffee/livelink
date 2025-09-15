export interface ErrorBannerProps {
  /**
   * The error message to display
   */
  message: string
  /**
   * Additional CSS classes to apply to the banner
   */
  class?: string
  /**
   * Optional callback when the dismiss button is clicked
   */
  onDismiss?: () => void
}

/**
 * Error banner component for displaying error messages
 *
 * @param props - The error banner props
 * @returns JSX element
 */
export function ErrorBanner(props: ErrorBannerProps) {
  return (
    <div
      class={`bg-red-50 border border-red-200 rounded-lg p-4 ${props.class || ''}`}
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg
            class="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium text-red-800">エラーが発生しました</p>
          <p class="mt-1 text-sm text-red-700">{props.message}</p>
        </div>
        {props.onDismiss && (
          <div class="ml-auto pl-3">
            <div class="-mx-1.5 -my-1.5">
              <button
                type="button"
                class="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                onClick={props.onDismiss}
              >
                <span class="sr-only">閉じる</span>
                <svg
                  class="w-4 h-4"
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
