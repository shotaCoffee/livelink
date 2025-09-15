/// <reference types="vitest/globals" />

import type { MockedFunction } from 'vitest'
import type { AuthResponse, AuthError } from '@supabase/supabase-js'

// Supabase mock types
export interface MockedSupabaseAuth {
  signUp: MockedFunction<(credentials: any) => Promise<AuthResponse>>
  signInWithPassword: MockedFunction<(credentials: any) => Promise<any>>
  signOut: MockedFunction<() => Promise<{ error: AuthError | null }>>
  getSession: MockedFunction<() => Promise<any>>
  getUser: MockedFunction<() => Promise<any>>
  onAuthStateChange: MockedFunction<(callback: any) => any>
}

export interface MockedSupabaseQueryBuilder {
  from: MockedFunction<(table: string) => MockedSupabaseQueryBuilder>
  select: MockedFunction<(columns?: string) => MockedSupabaseQueryBuilder>
  insert: MockedFunction<(data: any) => MockedSupabaseQueryBuilder>
  update: MockedFunction<(data: any) => MockedSupabaseQueryBuilder>
  delete: MockedFunction<() => MockedSupabaseQueryBuilder>
  eq: MockedFunction<(column: string, value: any) => MockedSupabaseQueryBuilder>
  match: MockedFunction<(query: any) => MockedSupabaseQueryBuilder>
  order: MockedFunction<(column: string, options?: any) => Promise<any>>
  or: MockedFunction<(query: string) => MockedSupabaseQueryBuilder>
  single: MockedFunction<() => Promise<any>>
}

export interface MockedSupabaseClient extends MockedSupabaseQueryBuilder {
  auth: MockedSupabaseAuth
}
