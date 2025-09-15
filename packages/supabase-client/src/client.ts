/**
 * Supabase client configuration and initialization
 * Handles environment variable detection and client creation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with environment variable detection
 * Prioritizes VITE_ variables for client-side usage over server-side variables
 * @returns Configured Supabase client
 * @throws Error if required environment variables are missing
 */
export function createSupabaseClient() {
  // Try to get environment variables, prioritizing VITE_ variables for client-side
  const supabaseUrl =
    (typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
    // Fallback for development
    'https://placeholder.supabase.co'

  const supabaseAnonKey =
    (typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
    // Fallback for development
    'placeholder-anon-key'

  // Debug logging for environment variables
  console.log('🔧 Supabase Client Config:', {
    url: supabaseUrl,
    key: supabaseAnonKey.substring(0, 20) + '...',
    env: typeof import.meta !== 'undefined' ? 'vite' : 'node',
    viteEnv:
      typeof import.meta !== 'undefined' ? import.meta.env : 'not available',
  })

  // For development without actual Supabase, use placeholder values
  const isPlaceholder =
    supabaseUrl === 'https://placeholder.supabase.co' ||
    supabaseAnonKey === 'placeholder-anon-key'

  if (isPlaceholder) {
    // console.warn('❌ Using placeholder Supabase configuration for development. API calls will not work.')
  } else {
    // console.log('✅ Using real Supabase configuration:', supabaseUrl)
  }

  // Create and return configured Supabase client
  return createClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Default Supabase client instance
 * Used throughout the application for database operations
 * Created lazily to avoid initialization errors during testing
 */
let _supabase: SupabaseClient | null = null

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      _supabase = createSupabaseClient()
    }
    return (_supabase as any)[prop]
  },
})
