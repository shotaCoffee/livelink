// Supabaseクライアントのモック
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  }),
}))

import { createClient } from '@supabase/supabase-js'
import { supabase, createSupabaseClient } from '../src/client'

const mockCreateClient = vi.mocked(createClient)

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 環境変数をリセット
    delete process.env.VITE_SUPABASE_URL
    delete process.env.VITE_SUPABASE_ANON_KEY
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_ANON_KEY
  })

  describe('createSupabaseClient', () => {
    it('should create client with VITE_ environment variables', () => {
      process.env.VITE_SUPABASE_URL = 'https://test.supabase.co'
      process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key'

      const client = createSupabaseClient()
      expect(client).toBeDefined()
      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key'
      )
    })

    it('should create client with server-side environment variables', () => {
      process.env.SUPABASE_URL = 'https://server.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'server-anon-key'

      const client = createSupabaseClient()
      expect(client).toBeDefined()
      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://server.supabase.co',
        'server-anon-key'
      )
    })

    it('should prioritize VITE_ variables over server-side variables', () => {
      process.env.VITE_SUPABASE_URL = 'https://vite.supabase.co'
      process.env.VITE_SUPABASE_ANON_KEY = 'vite-anon-key'
      process.env.SUPABASE_URL = 'https://server.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'server-anon-key'

      createSupabaseClient()
      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://vite.supabase.co',
        'vite-anon-key'
      )
    })

    it('should use placeholder values when environment variables are missing', () => {
      delete process.env.VITE_SUPABASE_URL
      delete process.env.VITE_SUPABASE_ANON_KEY
      delete process.env.SUPABASE_URL
      delete process.env.SUPABASE_ANON_KEY

      const client = createSupabaseClient()
      expect(client).toBeDefined()
      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://placeholder.supabase.co',
        'placeholder-anon-key'
      )
    })

    it('should use placeholder URL when URL is missing', () => {
      process.env.VITE_SUPABASE_ANON_KEY = 'test-key'

      const client = createSupabaseClient()
      expect(client).toBeDefined()
      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://placeholder.supabase.co',
        'test-key'
      )
    })

    it('should use placeholder ANON_KEY when ANON_KEY is missing', () => {
      process.env.VITE_SUPABASE_URL = 'https://test.supabase.co'

      const client = createSupabaseClient()
      expect(client).toBeDefined()
      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'placeholder-anon-key'
      )
    })
  })

  describe('default supabase client export', () => {
    it('should export a default configured client', () => {
      process.env.VITE_SUPABASE_URL = 'https://default.supabase.co'
      process.env.VITE_SUPABASE_ANON_KEY = 'default-key'

      expect(supabase).toBeDefined()
      expect(supabase.from).toBeDefined()
      expect(supabase.auth).toBeDefined()
    })
  })
})
