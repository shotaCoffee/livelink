import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SetlistItem, ApiResponse } from '@band-setlist/shared'
import type { MockedSupabaseClient } from '../vitest-env'
import { setlistQueries } from '../src/queries/setlists'

// Supabaseクライアントのモック
vi.mock('../src/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    single: vi.fn(),
  },
}))

import { supabase } from '../src/client'
const mockSupabaseClient = vi.mocked(
  supabase
) as unknown as MockedSupabaseClient

describe('Setlist Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('setlistQueries.getByLiveId', () => {
    it('should fetch all setlist items for a live event', async () => {
      const mockSetlistItems: SetlistItem[] = [
        {
          id: 'setlist1',
          live_id: 'live1',
          song_id: 'song1',
          order_index: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'setlist2',
          live_id: 'live1',
          song_id: 'song2',
          order_index: 2,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      ;(mockSupabaseClient as any).order.mockResolvedValue({
        data: mockSetlistItems,
        error: null,
      })

      const result: ApiResponse<SetlistItem[]> =
        await setlistQueries.getByLiveId('live1')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('setlist_items')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('live_id', 'live1')
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('order_index', {
        ascending: true,
      })
      expect(result.data).toEqual(mockSetlistItems)
      expect(result.error).toBeNull()
    })

    it('should handle database errors when fetching setlist items', async () => {
      ;(mockSupabaseClient as any).order.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      })

      const result: ApiResponse<SetlistItem[]> =
        await setlistQueries.getByLiveId('live1')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Database connection failed')
    })
  })

  describe('setlistQueries.addSong', () => {
    it('should add a song to a live setlist', async () => {
      const mockSetlistItem: SetlistItem = {
        id: 'new-setlist-id',
        live_id: 'live1',
        song_id: 'song1',
        order_index: 3,
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
      }

      ;(mockSupabaseClient as any).single.mockResolvedValue({
        data: mockSetlistItem,
        error: null,
      })

      const result: ApiResponse<SetlistItem> = await setlistQueries.addSong(
        'live1',
        'song1',
        3
      )

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('setlist_items')
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        live_id: 'live1',
        song_id: 'song1',
        order_index: 3,
      })
      expect(mockSupabaseClient.select).toHaveBeenCalled()
      expect(mockSupabaseClient.single).toHaveBeenCalled()
      expect(result.data).toEqual(mockSetlistItem)
      expect(result.error).toBeNull()
    })

    it('should handle creation errors', async () => {
      ;(mockSupabaseClient as any).single.mockResolvedValue({
        data: null,
        error: { message: 'Song already exists in setlist' },
      })

      const result: ApiResponse<SetlistItem> = await setlistQueries.addSong(
        'live1',
        'song1',
        1
      )

      expect(result.data).toBeNull()
      expect(result.error).toBe('Song already exists in setlist')
    })
  })

  describe('setlistQueries.updateOrder', () => {
    it('should update the order of a setlist item', async () => {
      const mockUpdatedItem: SetlistItem = {
        id: 'setlist1',
        live_id: 'live1',
        song_id: 'song1',
        order_index: 5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
      }

      ;(mockSupabaseClient as any).single.mockResolvedValue({
        data: mockUpdatedItem,
        error: null,
      })

      const result: ApiResponse<SetlistItem> = await setlistQueries.updateOrder(
        'setlist1',
        5
      )

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('setlist_items')
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        order_index: 5,
        updated_at: expect.any(String), // ISO timestamp
      })
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'setlist1')
      expect(mockSupabaseClient.select).toHaveBeenCalled()
      expect(mockSupabaseClient.single).toHaveBeenCalled()
      expect(result.data).toEqual(mockUpdatedItem)
      expect(result.error).toBeNull()
    })
  })

  describe('setlistQueries.removeSong', () => {
    it('should remove a song from setlist by id', async () => {
      ;(mockSupabaseClient as any).eq.mockResolvedValue({
        data: null,
        error: null,
      })

      const result: ApiResponse<null> =
        await setlistQueries.removeSong('setlist1')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('setlist_items')
      expect(mockSupabaseClient.delete).toHaveBeenCalled()
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'setlist1')
      expect(result.data).toBeNull()
      expect(result.error).toBeNull()
    })

    it('should handle delete errors', async () => {
      ;(mockSupabaseClient as any).eq.mockResolvedValue({
        data: null,
        error: { message: 'Setlist item not found' },
      })

      const result: ApiResponse<null> =
        await setlistQueries.removeSong('nonexistent')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Setlist item not found')
    })
  })

  describe('setlistQueries.clearSetlist', () => {
    it('should remove all songs from a live setlist', async () => {
      ;(mockSupabaseClient as any).eq.mockResolvedValue({
        data: null,
        error: null,
      })

      const result: ApiResponse<null> =
        await setlistQueries.clearSetlist('live1')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('setlist_items')
      expect(mockSupabaseClient.delete).toHaveBeenCalled()
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('live_id', 'live1')
      expect(result.data).toBeNull()
      expect(result.error).toBeNull()
    })

    it('should handle clear errors', async () => {
      ;(mockSupabaseClient as any).eq.mockResolvedValue({
        data: null,
        error: { message: 'Live event not found' },
      })

      const result: ApiResponse<null> =
        await setlistQueries.clearSetlist('nonexistent')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Live event not found')
    })
  })
})
