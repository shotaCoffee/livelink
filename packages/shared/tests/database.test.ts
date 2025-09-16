import { describe, it, expect, expectTypeOf } from 'vitest'
import {
  Song,
  Live,
  Band,
  SetlistItem,
  LiveWithSetlist,
  ApiResponse,
  PaginatedResponse,
} from '../src/types/database'

describe('Database Types', () => {
  describe('Song type', () => {
    it('should have required string fields', () => {
      expectTypeOf<Song>().toMatchTypeOf<{
        id: string
        band_id: string
        title: string
        artist: string
        created_at: string
        updated_at: string
      }>()
    })

    it('should have optional URL fields', () => {
      expectTypeOf<Song>().toMatchTypeOf<{
        youtube_url?: string
        spotify_url?: string
      }>()
    })

    it('should accept valid song data', () => {
      const validSong: Song = {
        id: 'song_123',
        band_id: 'band_456',
        title: 'Test Song',
        artist: 'Test Artist',
        youtube_url: 'https://youtube.com/watch?v=abc123',
        spotify_url: 'https://open.spotify.com/track/xyz789',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      }

      expect(validSong.id).toBe('song_123')
      expect(validSong.title).toBe('Test Song')
    })
  })

  describe('Band type', () => {
    it('should have required fields for band entity', () => {
      expectTypeOf<Band>().toMatchTypeOf<{
        id: string
        user_id: string
        name: string
        created_at: string
        updated_at: string
      }>()
    })

    it('should have optional description and avatar_url fields', () => {
      expectTypeOf<Band>().toMatchTypeOf<{
        description?: string
        avatar_url?: string
      }>()
    })
  })

  describe('Live type', () => {
    it('should have required fields for live event', () => {
      expectTypeOf<Live>().toMatchTypeOf<{
        id: string
        band_id: string
        title: string
        date: string
        venue: string
        is_upcoming: boolean
        created_at: string
        updated_at: string
      }>()
    })

    it('should have optional fields', () => {
      expectTypeOf<Live>().toMatchTypeOf<{
        description?: string
        ticket_url?: string
        share_slug?: string
      }>()
    })
  })

  describe('SetlistItem type', () => {
    it('should have required fields for setlist items', () => {
      expectTypeOf<SetlistItem>().toMatchTypeOf<{
        id: string
        live_id: string
        song_id: string
        order_index: number
        created_at: string
      }>()
    })

    it('should have optional songs relation', () => {
      expectTypeOf<SetlistItem>().toMatchTypeOf<{
        songs?: Song
      }>()
    })
  })

  describe('LiveWithSetlist type', () => {
    it('should extend Live with setlists and bands relations', () => {
      expectTypeOf<LiveWithSetlist>().toMatchTypeOf<
        Live & {
          setlists: SetlistItem[]
          bands?: Band
        }
      >()
    })
  })

  describe('ApiResponse type', () => {
    it('should be a generic type with data and error fields', () => {
      expectTypeOf<ApiResponse<string>>().toMatchTypeOf<{
        data: string | null
        error: string | null
      }>()
    })

    it('should work with Song type', () => {
      expectTypeOf<ApiResponse<Song>>().toMatchTypeOf<{
        data: Song | null
        error: string | null
      }>()
    })
  })

  describe('PaginatedResponse type', () => {
    it('should be a generic type with pagination fields', () => {
      expectTypeOf<PaginatedResponse<Song>>().toMatchTypeOf<{
        data: Song[]
        total: number
        page: number
        limit: number
      }>()
    })
  })
})
