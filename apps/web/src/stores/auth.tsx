import { createContext, useContext, createEffect, JSX } from 'solid-js'
import { createStore } from 'solid-js/store'
import { auth as supabaseAuth } from '@band-setlist/supabase-client'
import type { ApiResponse } from '@band-setlist/shared'

export interface User {
  id: string
  email: string
  created_at: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
}

export interface AuthContextType {
  state: AuthState
  signUp: (email: string, password: string) => Promise<ApiResponse<User>>
  signIn: (email: string, password: string) => Promise<ApiResponse<User>>
  signOut: () => Promise<void>
  checkSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>()

export function AuthProvider(props: { children: JSX.Element }) {
  const [state, setState] = createStore<AuthState>({
    user: null,
    loading: false,
    initialized: false,
  })

  const checkSession = async () => {
    setState('loading', true)
    try {
      // Check if we have a valid Supabase URL (not placeholder)
      const isLocalSupabase = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'localhost:54321'
      )
      const isPlaceholder = import.meta.env?.VITE_SUPABASE_URL?.includes(
        'placeholder'
      )

      if (isPlaceholder && !isLocalSupabase) {
        console.warn(
          'Development mode: Using placeholder config, skipping Supabase session check'
        )
        setState('user', null)
        setState('loading', false)
        setState('initialized', true)
        return
      }

      const result = await supabaseAuth.getSession()
      if (result.data?.session?.user) {
        setState('user', {
          id: result.data.session.user.id,
          email: result.data.session.user.email || '',
          created_at: result.data.session.user.created_at || '',
        })
      } else {
        setState('user', null)
      }
    } catch (error) {
      console.error('Session check failed:', error)
      setState('user', null)
    } finally {
      setState('loading', false)
      setState('initialized', true)
    }
  }

  const signUp = async (
    email: string,
    password: string
  ): Promise<ApiResponse<User>> => {
    setState('loading', true)
    try {
      const result = await supabaseAuth.signUp(email, password)
      if (result.data?.user) {
        const user: User = {
          id: result.data.user.id,
          email: result.data.user.email || email,
          created_at: result.data.user.created_at || new Date().toISOString(),
        }
        setState('user', user)
        return { data: user, error: null }
      }
      return {
        data: null,
        error: result.error?.message || 'サインアップに失敗しました',
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'サインアップに失敗しました'
      return { data: null, error: errorMessage }
    } finally {
      setState('loading', false)
    }
  }

  const signIn = async (
    email: string,
    password: string
  ): Promise<ApiResponse<User>> => {
    setState('loading', true)
    try {
      const result = await supabaseAuth.signIn(email, password)
      if (result.data?.user) {
        const user: User = {
          id: result.data.user.id,
          email: result.data.user.email || email,
          created_at: result.data.user.created_at || new Date().toISOString(),
        }
        setState('user', user)
        return { data: user, error: null }
      }
      return {
        data: null,
        error: result.error?.message || 'ログインに失敗しました',
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'ログインに失敗しました'
      return { data: null, error: errorMessage }
    } finally {
      setState('loading', false)
    }
  }

  const signOut = async () => {
    setState('loading', true)
    try {
      await supabaseAuth.signOut()
      setState('user', null)
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setState('loading', false)
    }
  }

  // Check session on mount
  createEffect(() => {
    checkSession()
  })

  const contextValue: AuthContextType = {
    state,
    signUp,
    signIn,
    signOut,
    checkSession,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
