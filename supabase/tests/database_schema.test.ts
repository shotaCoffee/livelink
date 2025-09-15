/**
 * Database Schema Tests
 * TDD approach for validating database schema consistency
 * Following @t_wada TDD principles
 */

import { createClient } from '@supabase/supabase-js'
import { describe, test, expect, beforeAll, afterAll } from 'vitest'

// Test database connection
const supabase = createClient(
  process.env.SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
)

describe('Database Schema Validation', () => {
  describe('Tables Structure', () => {
    test('bands table should have correct columns', async () => {
      const { data, error } = await supabase
        .from('bands')
        .select('*')
        .limit(0)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      // Test with actual seed data to verify structure
      const { data: sampleBand, error: sampleError } = await supabase
        .from('bands')
        .select('id, user_id, name, description, avatar_url, created_at, updated_at')
        .limit(1)

      expect(sampleError).toBeNull()
      expect(sampleBand).toBeDefined()
      expect(Array.isArray(sampleBand)).toBe(true)
    })

    test('songs table should have correct columns', async () => {
      const { data: sampleSong, error } = await supabase
        .from('songs')
        .select('id, band_id, title, artist, youtube_url, spotify_url, created_at, updated_at')
        .limit(1)

      expect(error).toBeNull()
      expect(sampleSong).toBeDefined()
      expect(Array.isArray(sampleSong)).toBe(true)
    })

    test('lives table should have correct columns and match TypeScript types', async () => {
      // This test will FAIL initially because the schema has 'name' but types expect 'title'
      const { data: sampleLive, error } = await supabase
        .from('lives')
        .select('*')
        .limit(1)

      expect(error).toBeNull()
      expect(sampleLive).toBeDefined()
      expect(Array.isArray(sampleLive)).toBe(true)

      if (sampleLive && sampleLive.length > 0) {
        const live = sampleLive[0]

        // Check required fields according to TypeScript types
        expect(live).toHaveProperty('id')
        expect(live).toHaveProperty('band_id')

        // INTENTIONAL FAILURE: This test expects 'title' but schema has 'name'
        // This will drive us to fix the inconsistency
        expect(live).toHaveProperty('title') // Will FAIL - schema has 'name'

        expect(live).toHaveProperty('date')
        expect(live).toHaveProperty('venue')
        expect(live).toHaveProperty('is_upcoming')
        expect(live).toHaveProperty('share_slug')
        expect(live).toHaveProperty('created_at')
        expect(live).toHaveProperty('updated_at')
      }
    })

    test('setlist_items table should have correct columns', async () => {
      const { data: sampleSetlistItem, error } = await supabase
        .from('setlist_items')
        .select('id, live_id, song_id, order_index, created_at')
        .limit(1)

      expect(error).toBeNull()
      expect(sampleSetlistItem).toBeDefined()
      expect(Array.isArray(sampleSetlistItem)).toBe(true)
    })
  })

  describe('Foreign Key Relationships', () => {
    test('songs should reference bands correctly', async () => {
      const { data: songs, error } = await supabase
        .from('songs')
        .select(`
          id,
          band_id,
          title,
          bands!inner (
            id,
            name
          )
        `)
        .limit(1)

      expect(error).toBeNull()
      expect(songs).toBeDefined()
      expect(Array.isArray(songs)).toBe(true)

      if (songs && songs.length > 0) {
        expect(songs[0]).toHaveProperty('bands')
        expect(songs[0].bands).toHaveProperty('id')
        expect(songs[0].bands).toHaveProperty('name')
      }
    })

    test('lives should reference bands correctly', async () => {
      const { data: lives, error } = await supabase
        .from('lives')
        .select(`
          id,
          band_id,
          bands!inner (
            id,
            name
          )
        `)
        .limit(1)

      expect(error).toBeNull()
      expect(lives).toBeDefined()
      expect(Array.isArray(lives)).toBe(true)

      if (lives && lives.length > 0) {
        expect(lives[0]).toHaveProperty('bands')
        expect(lives[0].bands).toHaveProperty('id')
        expect(lives[0].bands).toHaveProperty('name')
      }
    })

    test('setlist_items should reference lives and songs correctly', async () => {
      const { data: setlistItems, error } = await supabase
        .from('setlist_items')
        .select(`
          id,
          live_id,
          song_id,
          order_index,
          lives!inner (
            id,
            title
          ),
          songs!inner (
            id,
            title,
            artist
          )
        `)
        .limit(1)

      expect(error).toBeNull()
      expect(setlistItems).toBeDefined()
      expect(Array.isArray(setlistItems)).toBe(true)

      if (setlistItems && setlistItems.length > 0) {
        const item = setlistItems[0]
        expect(item).toHaveProperty('lives')
        expect(item).toHaveProperty('songs')
        expect(item.lives).toHaveProperty('id')
        expect(item.songs).toHaveProperty('id')
        expect(item.songs).toHaveProperty('title')
        expect(item.songs).toHaveProperty('artist')
      }
    })
  })

  describe('Data Type Consistency Tests', () => {
    test('UUID fields should be valid UUIDs', async () => {
      const { data: band, error } = await supabase
        .from('bands')
        .select('id, user_id')
        .limit(1)

      expect(error).toBeNull()
      expect(band).toBeDefined()

      if (band && band.length > 0) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        expect(band[0].id).toMatch(uuidRegex)
        expect(band[0].user_id).toMatch(uuidRegex)
      }
    })

    test('Date fields should be valid ISO dates', async () => {
      const { data: live, error } = await supabase
        .from('lives')
        .select('date, created_at, updated_at')
        .limit(1)

      expect(error).toBeNull()
      expect(live).toBeDefined()

      if (live && live.length > 0) {
        const liveData = live[0]

        // Date field should be a valid date
        expect(liveData.date).toBeDefined()
        expect(new Date(liveData.date)).toBeInstanceOf(Date)
        expect(isNaN(new Date(liveData.date).getTime())).toBe(false)

        // Timestamp fields should be valid ISO dates
        expect(liveData.created_at).toBeDefined()
        expect(liveData.updated_at).toBeDefined()
        expect(new Date(liveData.created_at)).toBeInstanceOf(Date)
        expect(new Date(liveData.updated_at)).toBeInstanceOf(Date)
      }
    })

    test('Boolean fields should have correct types', async () => {
      const { data: live, error } = await supabase
        .from('lives')
        .select('is_upcoming')
        .limit(1)

      expect(error).toBeNull()
      expect(live).toBeDefined()

      if (live && live.length > 0) {
        expect(typeof live[0].is_upcoming).toBe('boolean')
      }
    })

    test('Integer fields should have correct types', async () => {
      const { data: setlistItem, error } = await supabase
        .from('setlist_items')
        .select('order_index')
        .limit(1)

      expect(error).toBeNull()
      expect(setlistItem).toBeDefined()

      if (setlistItem && setlistItem.length > 0) {
        expect(typeof setlistItem[0].order_index).toBe('number')
        expect(Number.isInteger(setlistItem[0].order_index)).toBe(true)
      }
    })
  })

  describe('Unique Constraints', () => {
    test('share_slug should be unique', async () => {
      // Try to insert duplicate share_slug - should fail
      const testBandId = '550e8400-e29b-41d4-a716-446655440000'

      const { error } = await supabase
        .from('lives')
        .insert({
          band_id: testBandId,
          title: 'Test Live 2',
          date: '2024-12-25',
          venue: 'Test Venue',
          share_slug: 'testlive' // This should conflict with seed data
        })

      // Should fail due to unique constraint
      expect(error).toBeDefined()
      expect(error?.message).toContain('duplicate key value')
    })

    test('setlist_items should have unique order_index per live', async () => {
      const testLiveId = '550e8400-e29b-41d4-a716-446655440020'
      const testSongId = '550e8400-e29b-41d4-a716-446655440010'

      const { error } = await supabase
        .from('setlist_items')
        .insert({
          live_id: testLiveId,
          song_id: testSongId,
          order_index: 1 // This should conflict with seed data
        })

      // Should fail due to unique constraint
      expect(error).toBeDefined()
      expect(error?.message).toContain('duplicate key value')
    })
  })

  describe('Index Existence', () => {
    test('search index should exist for songs', async () => {
      // This tests that the GIN index for full-text search works
      const { data, error } = await supabase
        .from('songs')
        .select('id, title, artist')
        .textSearch('title', 'サンプル')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
    })
  })
})

describe('Seed Data Validation', () => {
  test('seed data should be present and valid', async () => {
    // Check bands
    const { data: bands, error: bandsError } = await supabase
      .from('bands')
      .select('*')

    expect(bandsError).toBeNull()
    expect(bands).toBeDefined()
    expect(bands!.length).toBeGreaterThan(0)

    // Check songs
    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('*')

    expect(songsError).toBeNull()
    expect(songs).toBeDefined()
    expect(songs!.length).toBeGreaterThan(0)

    // Check lives
    const { data: lives, error: livesError } = await supabase
      .from('lives')
      .select('*')

    expect(livesError).toBeNull()
    expect(lives).toBeDefined()
    expect(lives!.length).toBeGreaterThan(0)

    // Check setlist_items
    const { data: setlistItems, error: setlistError } = await supabase
      .from('setlist_items')
      .select('*')

    expect(setlistError).toBeNull()
    expect(setlistItems).toBeDefined()
    expect(setlistItems!.length).toBeGreaterThan(0)
  })
})