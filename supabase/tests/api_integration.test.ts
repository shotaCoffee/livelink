/**
 * API Integration Tests
 * TDD approach for validating API endpoints and business logic
 * Following @t_wada TDD principles
 */

import { createClient } from '@supabase/supabase-js'
import { describe, test, expect, beforeAll, afterEach, beforeEach } from 'vitest'
import type { Database } from '@band-setlist/shared'

// Test database connection using service role for full access
const supabase = createClient<Database>(
  process.env.SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

// Test user for authentication testing
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123'
}

describe('API Integration Tests', () => {
  let testUserId: string
  let testBandId: string
  let testSongId: string
  let testLiveId: string

  beforeAll(async () => {
    // Create test user for authentication
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true
    })

    if (authError) throw authError
    testUserId = authData.user.id
  })

  beforeEach(async () => {
    // Create test data for each test
    const { data: band, error: bandError } = await supabase
      .from('bands')
      .insert({
        user_id: testUserId,
        name: 'Test Band',
        description: 'A test band for integration testing'
      })
      .select()
      .single()

    if (bandError) throw bandError
    testBandId = band.id

    const { data: song, error: songError } = await supabase
      .from('songs')
      .insert({
        band_id: testBandId,
        title: 'Test Song',
        artist: 'Test Artist',
        youtube_url: 'https://www.youtube.com/watch?v=test',
        spotify_url: 'https://open.spotify.com/track/test'
      })
      .select()
      .single()

    if (songError) throw songError
    testSongId = song.id

    const { data: live, error: liveError } = await supabase
      .from('lives')
      .insert({
        band_id: testBandId,
        title: 'Test Live',
        date: '2025-01-01',
        venue: 'Test Venue',
        is_upcoming: true
      })
      .select()
      .single()

    if (liveError) throw liveError
    testLiveId = live.id
  })

  afterEach(async () => {
    // Clean up test data after each test
    if (testLiveId) {
      await supabase.from('setlist_items').delete().eq('live_id', testLiveId)
      await supabase.from('lives').delete().eq('id', testLiveId)
    }
    if (testSongId) {
      await supabase.from('songs').delete().eq('id', testSongId)
    }
    if (testBandId) {
      await supabase.from('bands').delete().eq('id', testBandId)
    }
  })

  describe('Bands API', () => {
    test('should create a new band', async () => {
      const newBand = {
        user_id: testUserId,
        name: 'New Test Band',
        description: 'Another test band'
      }

      const { data, error } = await supabase
        .from('bands')
        .insert(newBand)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.name).toBe(newBand.name)
      expect(data.description).toBe(newBand.description)
      expect(data.user_id).toBe(testUserId)
      expect(data.created_at).toBeDefined()
      expect(data.updated_at).toBeDefined()

      // Clean up
      await supabase.from('bands').delete().eq('id', data.id)
    })

    test('should retrieve bands for a user', async () => {
      const { data, error } = await supabase
        .from('bands')
        .select('*')
        .eq('user_id', testUserId)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThanOrEqual(1)

      const band = data.find(b => b.id === testBandId)
      expect(band).toBeDefined()
      expect(band!.name).toBe('Test Band')
    })

    test('should update a band', async () => {
      const updatedData = {
        name: 'Updated Test Band',
        description: 'Updated description'
      }

      const { data, error } = await supabase
        .from('bands')
        .update(updatedData)
        .eq('id', testBandId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.name).toBe(updatedData.name)
      expect(data.description).toBe(updatedData.description)
      expect(data.updated_at).not.toBe(data.created_at)
    })

    test('should delete a band and cascade to related data', async () => {
      // First, add a setlist item to test cascading
      await supabase
        .from('setlist_items')
        .insert({
          live_id: testLiveId,
          song_id: testSongId,
          order_index: 1
        })

      // Delete the band - should cascade
      const { error } = await supabase
        .from('bands')
        .delete()
        .eq('id', testBandId)

      expect(error).toBeNull()

      // Verify cascading deletion
      const { data: songs } = await supabase
        .from('songs')
        .select('*')
        .eq('band_id', testBandId)

      const { data: lives } = await supabase
        .from('lives')
        .select('*')
        .eq('band_id', testBandId)

      const { data: setlistItems } = await supabase
        .from('setlist_items')
        .select('*')
        .eq('live_id', testLiveId)

      expect(songs?.length).toBe(0)
      expect(lives?.length).toBe(0)
      expect(setlistItems?.length).toBe(0)

      // Reset IDs to prevent cleanup errors
      testBandId = ''
      testSongId = ''
      testLiveId = ''
    })
  })

  describe('Songs API', () => {
    test('should create a new song', async () => {
      const newSong = {
        band_id: testBandId,
        title: 'New Test Song',
        artist: 'New Test Artist',
        youtube_url: 'https://www.youtube.com/watch?v=newtest'
      }

      const { data, error } = await supabase
        .from('songs')
        .insert(newSong)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.title).toBe(newSong.title)
      expect(data.artist).toBe(newSong.artist)
      expect(data.youtube_url).toBe(newSong.youtube_url)
      expect(data.band_id).toBe(testBandId)

      // Clean up
      await supabase.from('songs').delete().eq('id', data.id)
    })

    test('should retrieve songs for a band', async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('band_id', testBandId)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThanOrEqual(1)

      const song = data.find(s => s.id === testSongId)
      expect(song).toBeDefined()
      expect(song!.title).toBe('Test Song')
      expect(song!.artist).toBe('Test Artist')
    })

    test('should search songs by title and artist', async () => {
      // Insert additional songs for search testing
      await supabase.from('songs').insert([
        { band_id: testBandId, title: 'Rock Song', artist: 'Rock Artist' },
        { band_id: testBandId, title: 'Pop Song', artist: 'Pop Artist' },
        { band_id: testBandId, title: 'Jazz Tune', artist: 'Jazz Musician' }
      ])

      // Test search by title
      const { data: titleSearch, error: titleError } = await supabase
        .from('songs')
        .select('*')
        .eq('band_id', testBandId)
        .textSearch('title', 'Rock')

      expect(titleError).toBeNull()
      expect(titleSearch?.length).toBeGreaterThanOrEqual(1)
      expect(titleSearch?.some(s => s.title.includes('Rock'))).toBe(true)

      // Clean up additional songs
      await supabase.from('songs').delete().eq('band_id', testBandId).neq('id', testSongId)
    })

    test('should update a song', async () => {
      const updatedData = {
        title: 'Updated Test Song',
        artist: 'Updated Test Artist'
      }

      const { data, error } = await supabase
        .from('songs')
        .update(updatedData)
        .eq('id', testSongId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.title).toBe(updatedData.title)
      expect(data.artist).toBe(updatedData.artist)
    })

    test('should delete a song', async () => {
      // Create a song to delete
      const { data: newSong, error: createError } = await supabase
        .from('songs')
        .insert({
          band_id: testBandId,
          title: 'Song to Delete',
          artist: 'Artist to Delete'
        })
        .select()
        .single()

      expect(createError).toBeNull()

      // Delete the song
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', newSong!.id)

      expect(error).toBeNull()

      // Verify deletion
      const { data: deletedSong } = await supabase
        .from('songs')
        .select('*')
        .eq('id', newSong!.id)
        .single()

      expect(deletedSong).toBeNull()
    })
  })

  describe('Lives API', () => {
    test('should create a new live', async () => {
      const newLive = {
        band_id: testBandId,
        title: 'New Test Live',
        date: '2025-06-01',
        venue: 'New Test Venue',
        is_upcoming: false
      }

      const { data, error } = await supabase
        .from('lives')
        .insert(newLive)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.title).toBe(newLive.title)
      expect(data.date).toBe(newLive.date)
      expect(data.venue).toBe(newLive.venue)
      expect(data.is_upcoming).toBe(newLive.is_upcoming)
      expect(data.band_id).toBe(testBandId)

      // Clean up
      await supabase.from('lives').delete().eq('id', data.id)
    })

    test('should retrieve lives for a band', async () => {
      const { data, error } = await supabase
        .from('lives')
        .select('*')
        .eq('band_id', testBandId)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThanOrEqual(1)

      const live = data.find(l => l.id === testLiveId)
      expect(live).toBeDefined()
      expect(live!.title).toBe('Test Live')
      expect(live!.venue).toBe('Test Venue')
    })

    test('should generate and use share_slug for public sharing', async () => {
      // Update live to have a share_slug
      const { data, error } = await supabase
        .from('lives')
        .update({ share_slug: 'test-share-123' })
        .eq('id', testLiveId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.share_slug).toBe('test-share-123')

      // Test public access via share_slug
      const { data: sharedLive, error: shareError } = await supabase
        .from('lives')
        .select('*, bands(name)')
        .eq('share_slug', 'test-share-123')
        .single()

      expect(shareError).toBeNull()
      expect(sharedLive).toBeDefined()
      expect(sharedLive.title).toBe('Test Live')
      expect(sharedLive.bands).toBeDefined()
    })

    test('should enforce unique share_slug constraint', async () => {
      // Set share_slug on test live
      await supabase
        .from('lives')
        .update({ share_slug: 'unique-test' })
        .eq('id', testLiveId)

      // Try to create another live with the same share_slug
      const { error } = await supabase
        .from('lives')
        .insert({
          band_id: testBandId,
          title: 'Duplicate Slug Live',
          date: '2025-07-01',
          venue: 'Duplicate Venue',
          share_slug: 'unique-test'
        })

      expect(error).toBeDefined()
      expect(error?.message).toContain('duplicate key value')
    })
  })

  describe('Setlist Management API', () => {
    test('should add songs to setlist with proper ordering', async () => {
      // Add first song
      const { data: item1, error: error1 } = await supabase
        .from('setlist_items')
        .insert({
          live_id: testLiveId,
          song_id: testSongId,
          order_index: 1
        })
        .select()
        .single()

      expect(error1).toBeNull()
      expect(item1.order_index).toBe(1)

      // Add second song
      const { data: song2 } = await supabase
        .from('songs')
        .insert({
          band_id: testBandId,
          title: 'Second Song',
          artist: 'Second Artist'
        })
        .select()
        .single()

      const { data: item2, error: error2 } = await supabase
        .from('setlist_items')
        .insert({
          live_id: testLiveId,
          song_id: song2!.id,
          order_index: 2
        })
        .select()
        .single()

      expect(error2).toBeNull()
      expect(item2.order_index).toBe(2)

      // Clean up
      await supabase.from('songs').delete().eq('id', song2!.id)
    })

    test('should retrieve complete setlist with song details', async () => {
      // Add song to setlist
      await supabase
        .from('setlist_items')
        .insert({
          live_id: testLiveId,
          song_id: testSongId,
          order_index: 1
        })

      // Retrieve setlist with song details
      const { data, error } = await supabase
        .from('setlist_items')
        .select(`
          id,
          order_index,
          songs (
            id,
            title,
            artist,
            youtube_url,
            spotify_url
          )
        `)
        .eq('live_id', testLiveId)
        .order('order_index', { ascending: true })

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)

      const item = data[0]
      expect(item.order_index).toBe(1)
      expect(item.songs).toBeDefined()
      expect(item.songs.title).toBe('Test Song')
      expect(item.songs.artist).toBe('Test Artist')
    })

    test('should update setlist item order', async () => {
      // Create multiple setlist items
      const { data: song2 } = await supabase
        .from('songs')
        .insert({
          band_id: testBandId,
          title: 'Song Two',
          artist: 'Artist Two'
        })
        .select()
        .single()

      await supabase.from('setlist_items').insert([
        { live_id: testLiveId, song_id: testSongId, order_index: 1 },
        { live_id: testLiveId, song_id: song2!.id, order_index: 2 }
      ])

      // Get first item
      const { data: item1 } = await supabase
        .from('setlist_items')
        .select('*')
        .eq('live_id', testLiveId)
        .eq('song_id', testSongId)
        .single()

      // Update its order
      const { data: updatedItem, error } = await supabase
        .from('setlist_items')
        .update({ order_index: 3 })
        .eq('id', item1!.id)
        .select()
        .single()

      expect(error).toBeNull()
      expect(updatedItem.order_index).toBe(3)

      // Clean up
      await supabase.from('songs').delete().eq('id', song2!.id)
    })

    test('should enforce unique order_index per live', async () => {
      // Add first song
      await supabase
        .from('setlist_items')
        .insert({
          live_id: testLiveId,
          song_id: testSongId,
          order_index: 1
        })

      // Try to add another song with same order_index
      const { data: song2 } = await supabase
        .from('songs')
        .insert({
          band_id: testBandId,
          title: 'Duplicate Order Song',
          artist: 'Duplicate Artist'
        })
        .select()
        .single()

      const { error } = await supabase
        .from('setlist_items')
        .insert({
          live_id: testLiveId,
          song_id: song2!.id,
          order_index: 1 // Same order as existing item
        })

      expect(error).toBeDefined()
      expect(error?.message).toContain('duplicate key value')

      // Clean up
      await supabase.from('songs').delete().eq('id', song2!.id)
    })

    test('should remove songs from setlist', async () => {
      // Add song to setlist
      const { data: item, error: addError } = await supabase
        .from('setlist_items')
        .insert({
          live_id: testLiveId,
          song_id: testSongId,
          order_index: 1
        })
        .select()
        .single()

      expect(addError).toBeNull()

      // Remove song from setlist
      const { error: removeError } = await supabase
        .from('setlist_items')
        .delete()
        .eq('id', item.id)

      expect(removeError).toBeNull()

      // Verify removal
      const { data: remainingItems } = await supabase
        .from('setlist_items')
        .select('*')
        .eq('live_id', testLiveId)

      expect(remainingItems?.length).toBe(0)
    })

    test('should clear entire setlist', async () => {
      // Add multiple songs to setlist
      const { data: song2 } = await supabase
        .from('songs')
        .insert({
          band_id: testBandId,
          title: 'Clear Test Song',
          artist: 'Clear Test Artist'
        })
        .select()
        .single()

      await supabase.from('setlist_items').insert([
        { live_id: testLiveId, song_id: testSongId, order_index: 1 },
        { live_id: testLiveId, song_id: song2!.id, order_index: 2 }
      ])

      // Clear setlist
      const { error } = await supabase
        .from('setlist_items')
        .delete()
        .eq('live_id', testLiveId)

      expect(error).toBeNull()

      // Verify clearance
      const { data: remainingItems } = await supabase
        .from('setlist_items')
        .select('*')
        .eq('live_id', testLiveId)

      expect(remainingItems?.length).toBe(0)

      // Clean up
      await supabase.from('songs').delete().eq('id', song2!.id)
    })
  })
})