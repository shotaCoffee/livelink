/**
 * Setlist CRUD operations for LiveLink application
 * Provides typed interfaces for setlist database operations using Supabase
 */

import { supabase } from '../client'
import type { SetlistItem, ApiResponse } from '@band-setlist/shared'

/**
 * Setlist query operations
 * All operations return standardized ApiResponse format for consistent error handling
 */
export const setlistQueries = {
  /**
   * Retrieve all setlist items for a specific live event
   * @param liveId - The ID of the live event to fetch setlist for
   * @returns Promise resolving to array of setlist items or error
   */
  async getByLiveId(liveId: string): Promise<ApiResponse<SetlistItem[]>> {
    const { data, error } = await supabase
      .from('setlist_items')
      .select(
        `
        *,
        songs (
          id,
          title,
          artist,
          youtube_url,
          spotify_url,
          created_at,
          updated_at
        )
      `
      )
      .eq('live_id', liveId)
      .order('order_index', { ascending: true })

    return { data, error: error?.message || null }
  },

  /**
   * Add a song to a live event setlist
   * @param liveId - The ID of the live event
   * @param songId - The ID of the song to add
   * @param orderIndex - The position index in the setlist
   * @returns Promise resolving to created setlist item or error
   */
  async addSong(
    liveId: string,
    songId: string,
    orderIndex: number
  ): Promise<ApiResponse<SetlistItem>> {
    const { data, error } = await supabase
      .from('setlist_items')
      .insert({
        live_id: liveId,
        song_id: songId,
        order_index: orderIndex,
      })
      .select()
      .single()

    return { data, error: error?.message || null }
  },

  /**
   * Update the order of a setlist item
   * @param id - The ID of the setlist item to update
   * @param orderIndex - The new order index
   * @returns Promise resolving to updated setlist item or error
   */
  async updateOrder(
    id: string,
    orderIndex: number
  ): Promise<ApiResponse<SetlistItem>> {
    const { data, error } = await supabase
      .from('setlist_items')
      .update({
        order_index: orderIndex,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    return { data, error: error?.message || null }
  },

  /**
   * Remove a song from setlist by setlist item ID
   * @param id - The ID of the setlist item to remove
   * @returns Promise resolving to null or error
   */
  async removeSong(id: string): Promise<ApiResponse<null>> {
    const { error } = await supabase.from('setlist_items').delete().eq('id', id)

    return { data: null, error: error?.message || null }
  },

  /**
   * Remove all songs from a live event setlist
   * @param liveId - The ID of the live event to clear setlist for
   * @returns Promise resolving to null or error
   */
  async clearSetlist(liveId: string): Promise<ApiResponse<null>> {
    const { error } = await supabase
      .from('setlist_items')
      .delete()
      .eq('live_id', liveId)

    return { data: null, error: error?.message || null }
  },
}
