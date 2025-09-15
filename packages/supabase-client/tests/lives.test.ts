import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Live, LiveFormData, ApiResponse } from '@band-setlist/shared'
import type { MockedSupabaseClient } from '../vitest-env'
import { liveQueries } from '../src/queries/lives'

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

describe('Live Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('liveQueries.getAll', () => {
    it('should fetch all live events for a band', async () => {
      const mockLives: Live[] = [
        {
          id: 'live1',
          band_id: 'band1',
          name: 'Summer Live 2024',
          date: '2024-07-15',
          venue: 'Tokyo Dome',
          is_upcoming: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'live2',
          band_id: 'band1',
          name: 'Winter Live 2023',
          date: '2023-12-25',
          venue: 'Yokohama Arena',
          is_upcoming: false,
          ticket_url: 'https://tickets.example.com/winter-live',
          share_slug: 'winter-live-2023',
          created_at: '2023-10-01T00:00:00Z',
          updated_at: '2023-10-01T00:00:00Z',
        },
      ]

      ;(mockSupabaseClient as any).order.mockResolvedValue({
        data: mockLives,
        error: null,
      })

      const result: ApiResponse<Live[]> = await liveQueries.getAll('band1')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('lives')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('band_id', 'band1')
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('date', {
        ascending: false,
      })
      expect(result.data).toEqual(mockLives)
      expect(result.error).toBeNull()
    })

    it('should handle database errors when fetching live events', async () => {
      ;(mockSupabaseClient as any).order.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      })

      const result: ApiResponse<Live[]> = await liveQueries.getAll('band1')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Database connection failed')
    })
  })

  describe('liveQueries.create', () => {
    it('should create a new live event with form data', async () => {
      const formData: LiveFormData = {
        name: 'New Live Event',
        date: '2024-08-15',
        venue: 'Saitama Super Arena',
        ticket_url: 'https://tickets.example.com/new-live',
        is_upcoming: true,
      }

      const mockCreatedLive: Live = {
        id: 'new-live-id',
        band_id: 'band1',
        name: 'New Live Event',
        date: '2024-08-15',
        venue: 'Saitama Super Arena',
        ticket_url: 'https://tickets.example.com/new-live',
        is_upcoming: true,
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
      }

      ;(mockSupabaseClient as any).single.mockResolvedValue({
        data: mockCreatedLive,
        error: null,
      })

      const result: ApiResponse<Live> = await liveQueries.create(
        'band1',
        formData
      )

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('lives')
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        band_id: 'band1',
        ...formData,
      })
      expect(mockSupabaseClient.select).toHaveBeenCalled()
      expect(mockSupabaseClient.single).toHaveBeenCalled()
      expect(result.data).toEqual(mockCreatedLive)
      expect(result.error).toBeNull()
    })

    it('should handle creation errors', async () => {
      const formData: LiveFormData = {
        name: '',
        date: '',
        venue: '', // Invalid data
      }

      ;(mockSupabaseClient as any).single.mockResolvedValue({
        data: null,
        error: { message: 'Name cannot be empty' },
      })

      const result: ApiResponse<Live> = await liveQueries.create(
        'band1',
        formData
      )

      expect(result.data).toBeNull()
      expect(result.error).toBe('Name cannot be empty')
    })
  })

  describe('liveQueries.update', () => {
    it('should update an existing live event', async () => {
      const updates: Partial<LiveFormData> = {
        name: 'Updated Live Event',
        venue: 'Updated Venue',
        ticket_url: 'https://tickets.example.com/updated',
      }

      const mockUpdatedLive: Live = {
        id: 'live1',
        band_id: 'band1',
        name: 'Updated Live Event',
        date: '2024-07-15',
        venue: 'Updated Venue',
        ticket_url: 'https://tickets.example.com/updated',
        is_upcoming: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
      }

      ;(mockSupabaseClient as any).single.mockResolvedValue({
        data: mockUpdatedLive,
        error: null,
      })

      const result: ApiResponse<Live> = await liveQueries.update(
        'live1',
        updates
      )

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('lives')
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        ...updates,
        updated_at: expect.any(String), // ISO timestamp
      })
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'live1')
      expect(mockSupabaseClient.select).toHaveBeenCalled()
      expect(mockSupabaseClient.single).toHaveBeenCalled()
      expect(result.data).toEqual(mockUpdatedLive)
      expect(result.error).toBeNull()
    })
  })

  describe('liveQueries.delete', () => {
    it('should delete a live event by id', async () => {
      ;(mockSupabaseClient as any).eq.mockResolvedValue({
        data: null,
        error: null,
      })

      const result: ApiResponse<null> = await liveQueries.delete('live1')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('lives')
      expect(mockSupabaseClient.delete).toHaveBeenCalled()
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'live1')
      expect(result.data).toBeNull()
      expect(result.error).toBeNull()
    })

    it('should handle delete errors', async () => {
      ;(mockSupabaseClient as any).eq.mockResolvedValue({
        data: null,
        error: { message: 'Live event not found' },
      })

      const result: ApiResponse<null> = await liveQueries.delete('nonexistent')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Live event not found')
    })
  })

  describe('liveQueries.getUpcoming', () => {
    it('should fetch only upcoming live events for a band', async () => {
      const mockUpcomingLives: Live[] = [
        {
          id: 'live1',
          band_id: 'band1',
          name: 'Summer Live 2024',
          date: '2024-07-15',
          venue: 'Tokyo Dome',
          is_upcoming: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      ;(mockSupabaseClient as any).order.mockResolvedValue({
        data: mockUpcomingLives,
        error: null,
      })

      const result: ApiResponse<Live[]> = await liveQueries.getUpcoming('band1')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('lives')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.match).toHaveBeenCalledWith({
        band_id: 'band1',
        is_upcoming: true,
      })
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('date', {
        ascending: true,
      })
      expect(result.data).toEqual(mockUpcomingLives)
      expect(result.error).toBeNull()
    })
  })

  describe('liveQueries.getByShareSlug', () => {
    it('should fetch live event by share slug for public access', async () => {
      const mockSharedLive: Live = {
        id: 'live1',
        band_id: 'band1',
        name: 'Summer Live 2024',
        date: '2024-07-15',
        venue: 'Tokyo Dome',
        is_upcoming: true,
        share_slug: 'summer-live-2024',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      ;(mockSupabaseClient as any).eq.mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: mockSharedLive,
          error: null,
        }),
      })

      const result: ApiResponse<Live> =
        await liveQueries.getByShareSlug('summer-live-2024')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('lives')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith(
        'share_slug',
        'summer-live-2024'
      )
      expect(result.data).toEqual(mockSharedLive)
      expect(result.error).toBeNull()
    })
  })
})
