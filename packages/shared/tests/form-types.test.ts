import { describe, it, expect, expectTypeOf } from 'vitest'
import {
  SongFormData,
  LiveFormData,
  LoadingState,
  PaginationState,
} from '../src/types/index'

describe('Form Types', () => {
  describe('SongFormData', () => {
    it('should have required fields for song creation', () => {
      expectTypeOf<SongFormData>().toMatchTypeOf<{
        title: string
        artist: string
      }>()
    })

    it('should have optional URL fields', () => {
      expectTypeOf<SongFormData>().toMatchTypeOf<{
        youtube_url?: string
        spotify_url?: string
      }>()
    })

    it('should accept valid song form data', () => {
      const validFormData: SongFormData = {
        title: 'New Song Title',
        artist: 'Artist Name',
        youtube_url: 'https://youtube.com/watch?v=example',
        spotify_url: 'https://open.spotify.com/track/example',
      }

      expect(validFormData.title).toBe('New Song Title')
      expect(validFormData.artist).toBe('Artist Name')
    })

    it('should work with minimal required data', () => {
      const minimalData: SongFormData = {
        title: 'Song Title',
        artist: 'Artist Name',
      }

      expect(minimalData.title).toBe('Song Title')
      expect(minimalData.youtube_url).toBeUndefined()
    })
  })

  describe('LiveFormData', () => {
    it('should have required fields for live event creation', () => {
      expectTypeOf<LiveFormData>().toMatchTypeOf<{
        title: string
        date: string
        venue: string
      }>()
    })

    it('should have optional fields', () => {
      expectTypeOf<LiveFormData>().toMatchTypeOf<{
        ticket_url?: string
        is_upcoming?: boolean
      }>()
    })

    it('should accept valid live event form data', () => {
      const validFormData: LiveFormData = {
        title: 'Summer Live 2024',
        date: '2024-07-15',
        venue: 'Tokyo Dome',
        ticket_url: 'https://tickets.example.com/summer-live-2024',
        is_upcoming: true,
      }

      expect(validFormData.title).toBe('Summer Live 2024')
      expect(validFormData.venue).toBe('Tokyo Dome')
    })
  })
})

describe('UI State Types', () => {
  describe('LoadingState', () => {
    it('should have isLoading boolean field', () => {
      expectTypeOf<LoadingState>().toMatchTypeOf<{
        isLoading: boolean
      }>()
    })

    it('should have optional error field', () => {
      expectTypeOf<LoadingState>().toMatchTypeOf<{
        error?: string
      }>()
    })

    it('should work in loading state', () => {
      const loadingState: LoadingState = {
        isLoading: true,
      }

      expect(loadingState.isLoading).toBe(true)
      expect(loadingState.error).toBeUndefined()
    })

    it('should work in error state', () => {
      const errorState: LoadingState = {
        isLoading: false,
        error: 'Something went wrong',
      }

      expect(errorState.isLoading).toBe(false)
      expect(errorState.error).toBe('Something went wrong')
    })
  })

  describe('PaginationState', () => {
    it('should have required pagination fields', () => {
      expectTypeOf<PaginationState>().toMatchTypeOf<{
        page: number
        limit: number
        total: number
      }>()
    })

    it('should accept valid pagination data', () => {
      const paginationState: PaginationState = {
        page: 2,
        limit: 10,
        total: 45,
      }

      expect(paginationState.page).toBe(2)
      expect(paginationState.limit).toBe(10)
      expect(paginationState.total).toBe(45)
    })

    it('should work with first page', () => {
      const firstPage: PaginationState = {
        page: 1,
        limit: 20,
        total: 100,
      }

      expect(firstPage.page).toBe(1)
      expect(Math.ceil(firstPage.total / firstPage.limit)).toBe(5) // total pages
    })
  })
})
