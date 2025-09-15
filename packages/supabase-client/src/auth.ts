/**
 * Authentication functions for LiveLink application
 * Provides a clean interface for Supabase authentication operations
 */

import { supabase } from './client'

/**
 * Authentication API wrapper
 * Provides typed interfaces for common authentication operations
 */
export const auth = {
  /**
   * Sign up a new user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to sign up result
   */
  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),

  /**
   * Sign in an existing user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to sign in result
   */
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  /**
   * Sign out the current user
   * @returns Promise resolving to sign out result
   */
  signOut: () => supabase.auth.signOut(),

  /**
   * Get the current session
   * @returns Promise resolving to current session data
   */
  getSession: () => supabase.auth.getSession(),

  /**
   * Get the current user
   * @returns Promise resolving to current user data
   */
  getUser: () => supabase.auth.getUser(),

  /**
   * Listen to authentication state changes
   * @param callback - Function to call when auth state changes
   * @returns Subscription object with unsubscribe method
   */
  onAuthStateChange: (callback: (event: string, session: any) => void) =>
    supabase.auth.onAuthStateChange(callback),
}
