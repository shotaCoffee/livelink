import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Session, User } from '@supabase/supabase-js'
import type { MockedSupabaseClient } from '../vitest-env'

// Supabaseクライアントのモック
vi.mock('../src/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))

import { auth } from '../src/auth'
import { supabase } from '../src/client'

const mockSupabaseClient = vi.mocked(
  supabase
) as unknown as MockedSupabaseClient

describe('Authentication Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('auth.signUp', () => {
    it('should call supabase.auth.signUp with correct parameters', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2024-01-01T00:00:00.000Z',
          } as User,
          session: null,
        },
        error: null,
      })

      const result = await auth.signUp('test@example.com', 'password123')

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.data).toBeDefined()
      expect(result.error).toBeNull()
    })

    it('should handle sign up errors', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Email already registered',
          code: 'signup_disabled',
          status: 400,
          __isAuthError: true,
          name: 'AuthError',
        } as any,
      })

      const result = await auth.signUp('existing@example.com', 'password123')

      expect(result.data.user).toBeNull()
      expect(result.error?.message).toBe('Email already registered')
    })
  })

  describe('auth.signIn', () => {
    it('should call supabase.auth.signInWithPassword with correct parameters', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2024-01-01T00:00:00.000Z',
          } as User,
        },
        error: null,
      })

      const result = await auth.signIn('test@example.com', 'password123')

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.data).toBeDefined()
    })

    it('should handle sign in errors', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      })

      const result = await auth.signIn('wrong@example.com', 'wrongpassword')

      expect(result.error?.message).toBe('Invalid credentials')
    })
  })

  describe('auth.signOut', () => {
    it('should call supabase.auth.signOut', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null })

      const result = await auth.signOut()

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
      expect(result.error).toBeNull()
    })
  })

  describe('auth.getSession', () => {
    it('should call supabase.auth.getSession', async () => {
      const mockSession: Partial<Session> = {
        access_token: 'token123',
        user: { id: '123' } as User,
      }
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const result = await auth.getSession()

      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled()
      expect(result.data.session).toEqual(mockSession)
    })
  })

  describe('auth.getUser', () => {
    it('should call supabase.auth.getUser', async () => {
      const mockUser: Partial<User> = { id: '123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await auth.getUser()

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled()
      expect(result.data.user).toEqual(mockUser)
    })
  })

  describe('auth.onAuthStateChange', () => {
    it('should call supabase.auth.onAuthStateChange with callback', () => {
      const mockCallback = vi.fn()
      const mockUnsubscribe = vi.fn()
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: mockUnsubscribe },
      })

      const result = auth.onAuthStateChange(mockCallback)

      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledWith(
        mockCallback
      )
      expect(result).toBeDefined()
    })
  })
})
