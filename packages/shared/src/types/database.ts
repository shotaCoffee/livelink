/**
 * Database entity types for LiveLink application
 * These types represent the core data structures stored in Supabase
 */

/**
 * Song entity - represents a musical track that can be included in setlists
 */
export interface Song {
  /** Unique identifier for the song */
  id: string
  /** ID of the band this song belongs to */
  band_id: string
  /** Title of the song */
  title: string
  /** Artist name */
  artist: string
  /** Optional YouTube URL for the song */
  youtube_url?: string
  /** Optional Spotify URL for the song */
  spotify_url?: string
  /** ISO timestamp when the song was created */
  created_at: string
  /** ISO timestamp when the song was last updated */
  updated_at: string
}

/**
 * Band entity - represents a musical band/group
 */
export interface Band {
  /** Unique identifier for the band */
  id: string
  /** ID of the user who owns this band */
  user_id: string
  /** Name of the band */
  name: string
  /** Optional description of the band */
  description?: string
  /** Optional avatar image URL */
  avatar_url?: string
  /** ISO timestamp when the band was created */
  created_at: string
  /** ISO timestamp when the band was last updated */
  updated_at: string
}

/**
 * Live event entity - represents a concert/performance
 */
export interface Live {
  /** Unique identifier for the live event */
  id: string
  /** ID of the band performing at this live event */
  band_id: string
  /** Title of the live event */
  title: string
  /** Date of the live event (ISO string) */
  date: string
  /** Venue name where the live event takes place */
  venue: string
  /** Optional description of the live event */
  description?: string
  /** Optional URL for ticket purchasing */
  ticket_url?: string
  /** Whether this is an upcoming event (true) or past event (false) */
  is_upcoming: boolean
  /** Optional slug for public sharing of this live event */
  share_slug?: string
  /** ISO timestamp when the live event was created */
  created_at: string
  /** ISO timestamp when the live event was last updated */
  updated_at: string
}

/**
 * SetlistItem entity - represents a song in a specific live event setlist
 */
export interface SetlistItem {
  /** Unique identifier for the setlist item */
  id: string
  /** ID of the live event this setlist item belongs to */
  live_id: string
  /** ID of the song in this setlist position */
  song_id: string
  /** Order/position of this song in the setlist (0-based) */
  order_index: number
  /** ISO timestamp when the setlist item was created */
  created_at: string
  /** ISO timestamp when the setlist item was last updated */
  updated_at: string
  /** Optional populated song data from join query */
  songs?: Song
}

/**
 * Extended Live type that includes related setlist items and band information
 */
export interface LiveWithSetlist extends Live {
  /** Array of setlist items for this live event */
  setlists: SetlistItem[]
  /** Optional populated band data from join query */
  bands?: Band
}

/**
 * Generic API response wrapper for single entities
 * @template T - The type of data being returned
 */
export type ApiResponse<T> = {
  /** The data returned from the API call, or null if error occurred */
  data: T | null
  /** Error message if the operation failed, or null if successful */
  error: string | null
}

/**
 * API response wrapper for paginated results
 * @template T - The type of data items being returned
 */
export type PaginatedResponse<T> = {
  /** Array of data items for the current page */
  data: T[]
  /** Total number of items available across all pages */
  total: number
  /** Current page number (1-based) */
  page: number
  /** Number of items per page */
  limit: number
}
