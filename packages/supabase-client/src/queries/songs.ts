/**
 * Song CRUD operations for LiveLink application
 * Provides typed interfaces for song database operations using Supabase
 */

import { supabase } from '../client'
import type { Song, SongFormData, ApiResponse } from '@band-setlist/shared'

/**
 * Song query operations
 * All operations return standardized ApiResponse format for consistent error handling
 */
export const songQueries = {
  /**
   * Retrieve all songs for a specific band
   * @param bandId - The ID of the band to fetch songs for
   * @returns Promise resolving to array of songs or error
   */
  async getAll(bandId: string): Promise<ApiResponse<Song[]>> {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('band_id', bandId)
      .order('created_at', { ascending: false })

    return { data, error: error?.message || null }
  },

  /**
   * Create a new song for a band
   * @param bandId - The ID of the band to create the song for
   * @param songData - Form data for the new song
   * @returns Promise resolving to created song or error
   */
  async create(
    bandId: string,
    songData: SongFormData
  ): Promise<ApiResponse<Song>> {
    const { data, error } = await supabase
      .from('songs')
      .insert({
        band_id: bandId,
        ...songData,
      })
      .select()
      .single()

    return { data, error: error?.message || null }
  },

  /**
   * Update an existing song
   * @param id - The ID of the song to update
   * @param updates - Partial song data to update
   * @returns Promise resolving to updated song or error
   */
  async update(
    id: string,
    updates: Partial<SongFormData>
  ): Promise<ApiResponse<Song>> {
    const { data, error } = await supabase
      .from('songs')
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
   * Delete a song by ID
   * @param id - The ID of the song to delete
   * @returns Promise resolving to null or error
   */
  async delete(id: string): Promise<ApiResponse<null>> {
    const { error } = await supabase.from('songs').delete().eq('id', id)

    return { data: null, error: error?.message || null }
  },

  /**
   * Search songs by title and artist within a band
   * @param bandId - The ID of the band to search within
   * @param query - Search query string
   * @returns Promise resolving to array of matching songs or error
   */
  async search(bandId: string, query: string): Promise<ApiResponse<Song[]>> {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('band_id', bandId)
      .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    return { data, error: error?.message || null }
  },
}
