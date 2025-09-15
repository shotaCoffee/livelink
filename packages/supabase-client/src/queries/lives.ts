/**
 * Live event CRUD operations for LiveLink application
 * Provides typed interfaces for live event database operations using Supabase
 */

import { supabase } from '../client'
import type { Live, LiveFormData, ApiResponse } from '@band-setlist/shared'

/**
 * Live event query operations
 * All operations return standardized ApiResponse format for consistent error handling
 */
export const liveQueries = {
  /**
   * Retrieve all live events for a specific band
   * @param bandId - The ID of the band to fetch live events for
   * @returns Promise resolving to array of live events or error
   */
  async getAll(bandId: string): Promise<ApiResponse<Live[]>> {
    const { data, error } = await supabase
      .from('lives')
      .select('*')
      .eq('band_id', bandId)
      .order('date', { ascending: false })

    return { data, error: error?.message || null }
  },

  /**
   * Create a new live event for a band
   * @param bandId - The ID of the band to create the live event for
   * @param liveData - Form data for the new live event
   * @returns Promise resolving to created live event or error
   */
  async create(
    bandId: string,
    liveData: LiveFormData
  ): Promise<ApiResponse<Live>> {
    const { data, error } = await supabase
      .from('lives')
      .insert({
        band_id: bandId,
        ...liveData,
      })
      .select()
      .single()

    return { data, error: error?.message || null }
  },

  /**
   * Update an existing live event
   * @param id - The ID of the live event to update
   * @param updates - Partial live event data to update
   * @returns Promise resolving to updated live event or error
   */
  async update(
    id: string,
    updates: Partial<LiveFormData>
  ): Promise<ApiResponse<Live>> {
    const { data, error } = await supabase
      .from('lives')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    return { data, error: error?.message || null }
  },

  /**
   * Delete a live event by ID
   * @param id - The ID of the live event to delete
   * @returns Promise resolving to null or error
   */
  async delete(id: string): Promise<ApiResponse<null>> {
    const { error } = await supabase.from('lives').delete().eq('id', id)

    return { data: null, error: error?.message || null }
  },

  /**
   * Get upcoming live events for a band
   * @param bandId - The ID of the band to fetch upcoming events for
   * @returns Promise resolving to array of upcoming live events or error
   */
  async getUpcoming(bandId: string): Promise<ApiResponse<Live[]>> {
    const { data, error } = await supabase
      .from('lives')
      .select('*')
      .match({ band_id: bandId, is_upcoming: true })
      .order('date', { ascending: true })

    return { data, error: error?.message || null }
  },

  /**
   * Get live event by share slug for public access
   * @param shareSlug - The public share slug for the live event
   * @returns Promise resolving to live event or error
   */
  async getByShareSlug(shareSlug: string): Promise<ApiResponse<Live>> {
    const { data, error } = await supabase
      .from('lives')
      .select('*')
      .eq('share_slug', shareSlug)
      .single()

    return { data, error: error?.message || null }
  },
}
