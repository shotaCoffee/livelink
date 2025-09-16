/**
 * Index file for all type definitions
 * Re-exports database types and defines form and UI state types
 */

// Re-export all database types
export * from './database'

/**
 * Form data types for creating and updating entities
 */

/**
 * Form data for creating/editing songs
 * Excludes database-managed fields like id, timestamps, band_id
 */
export interface SongFormData {
  /** Title of the song */
  title: string
  /** Artist name */
  artist: string
  /** Optional YouTube URL for the song */
  youtube_url?: string
  /** Optional Spotify URL for the song */
  spotify_url?: string
}

/**
 * Form data for creating/editing live events
 * Excludes database-managed fields like id, timestamps, band_id
 */
export interface LiveFormData {
  /** Title of the live event */
  title: string
  /** Date of the live event (ISO string or date input format) */
  date: string
  /** Venue name where the live event takes place */
  venue: string
  /** Optional description of the live event */
  description?: string
  /** Optional URL for ticket purchasing */
  ticket_url?: string
  /** Optional flag for whether this is an upcoming event */
  is_upcoming?: boolean
  /** Optional slug for public sharing of this live event */
  share_slug?: string
}

/**
 * UI State types for managing component states
 */

/**
 * Generic loading state for async operations
 */
export interface LoadingState {
  /** Whether an async operation is currently in progress */
  isLoading: boolean
  /** Error message if the operation failed */
  error?: string
}

/**
 * Pagination state for managing paginated lists
 */
export interface PaginationState {
  /** Current page number (1-based) */
  page: number
  /** Number of items per page */
  limit: number
  /** Total number of items available across all pages */
  total: number
}
