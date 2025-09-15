/**
 * Supabase Client Package for LiveLink Application
 *
 * This package provides a complete data access layer for the LiveLink application,
 * offering typed interfaces and consistent error handling for all database operations.
 *
 * @package @band-setlist/supabase-client
 */

// Core Supabase client
export { supabase } from './client'

// Authentication functionality
export * from './auth'

// Query operations
export { songQueries } from './queries/songs'
export { liveQueries } from './queries/lives'
export { setlistQueries } from './queries/setlists'

// Re-export types from shared package for convenience
export type {
  Song,
  Live,
  Band,
  SetlistItem,
  LiveWithSetlist,
  SongFormData,
  LiveFormData,
  ApiResponse,
  PaginatedResponse,
  LoadingState,
  PaginationState,
} from '@band-setlist/shared'
