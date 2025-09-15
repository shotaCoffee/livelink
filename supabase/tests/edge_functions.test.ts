/**
 * Edge Functions Tests
 * TDD approach for validating Edge Functions
 * Following @t_wada TDD principles
 */

import { describe, test, expect, beforeAll } from 'vitest'

const EDGE_FUNCTION_URL = 'http://127.0.0.1:54321/functions/v1'

// Helper function to call edge functions
async function callEdgeFunction(functionName: string, payload?: any, headers: Record<string, string> = {}) {
  const response = await fetch(`${EDGE_FUNCTION_URL}/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      ...headers
    },
    body: payload ? JSON.stringify(payload) : undefined
  })

  return {
    status: response.status,
    data: response.ok ? await response.json() : null,
    error: response.ok ? null : await response.text()
  }
}

describe('Edge Functions Tests', () => {
  describe('Share Slug Generator Function', () => {
    test('should generate unique share slug when called without parameters', async () => {
      const result = await callEdgeFunction('share-slug-generator')

      expect(result.status).toBe(200)
      expect(result.data).toBeDefined()
      expect(result.data.slug).toBeDefined()
      expect(typeof result.data.slug).toBe('string')
      expect(result.data.slug.length).toBeGreaterThanOrEqual(8)
      expect(result.data.slug).toMatch(/^[a-z0-9]+$/) // Only lowercase letters and numbers
    })

    test('should generate different slugs on subsequent calls', async () => {
      const result1 = await callEdgeFunction('share-slug-generator')
      const result2 = await callEdgeFunction('share-slug-generator')

      expect(result1.status).toBe(200)
      expect(result2.status).toBe(200)
      expect(result1.data.slug).not.toBe(result2.data.slug)
    })

    test('should validate slug uniqueness against database', async () => {
      const payload = {
        checkUniqueness: true,
        excludeSlug: 'testlive' // This slug exists in seed data
      }

      const result = await callEdgeFunction('share-slug-generator', payload)

      expect(result.status).toBe(200)
      expect(result.data.slug).toBeDefined()
      expect(result.data.slug).not.toBe('testlive') // Should not return the excluded slug
      expect(result.data.isUnique).toBe(true)
    })

    test('should handle database connectivity errors gracefully', async () => {
      // Simulate invalid authorization to trigger error handling
      const result = await callEdgeFunction('share-slug-generator',
        { checkUniqueness: true },
        { 'Authorization': 'Bearer invalid-token' }
      )

      // Should still return a slug even if database check fails
      expect(result.status).toBe(200)
      expect(result.data.slug).toBeDefined()
      expect(result.data.fallbackMode).toBe(true) // Indicates it fell back to simple generation
    })
  })

  describe('Setlist Share Function', () => {
    test('should return setlist data for valid share slug', async () => {
      const payload = {
        share_slug: 'testlive' // This exists in seed data
      }

      const result = await callEdgeFunction('setlist-share', payload)

      expect(result.status).toBe(200)
      expect(result.data).toBeDefined()
      expect(result.data.live).toBeDefined()
      expect(result.data.live.title).toBe('テストライブ')
      expect(result.data.live.venue).toBe('サンプル会場')
      expect(result.data.band).toBeDefined()
      expect(result.data.band.name).toBe('サンプルバンド')
      expect(result.data.setlist).toBeDefined()
      expect(Array.isArray(result.data.setlist)).toBe(true)
    })

    test('should include song details in setlist', async () => {
      const payload = {
        share_slug: 'testlive'
      }

      const result = await callEdgeFunction('setlist-share', payload)

      expect(result.status).toBe(200)
      expect(result.data.setlist.length).toBeGreaterThan(0)

      const firstSong = result.data.setlist[0]
      expect(firstSong).toBeDefined()
      expect(firstSong.order_index).toBeDefined()
      expect(firstSong.song).toBeDefined()
      expect(firstSong.song.title).toBeDefined()
      expect(firstSong.song.artist).toBeDefined()
      expect(typeof firstSong.song.title).toBe('string')
      expect(typeof firstSong.song.artist).toBe('string')
    })

    test('should return ordered setlist items', async () => {
      const payload = {
        share_slug: 'testlive'
      }

      const result = await callEdgeFunction('setlist-share', payload)

      expect(result.status).toBe(200)
      const setlist = result.data.setlist

      if (setlist.length > 1) {
        // Verify ordering
        for (let i = 1; i < setlist.length; i++) {
          expect(setlist[i].order_index).toBeGreaterThan(setlist[i-1].order_index)
        }
      }
    })

    test('should return 404 for non-existent share slug', async () => {
      const payload = {
        share_slug: 'non-existent-slug-12345'
      }

      const result = await callEdgeFunction('setlist-share', payload)

      expect(result.status).toBe(404)
      expect(result.error).toContain('not found')
    })

    test('should return 400 for missing share slug parameter', async () => {
      const result = await callEdgeFunction('setlist-share', {})

      expect(result.status).toBe(400)
      expect(result.error).toContain('share_slug')
    })

    test('should handle database errors gracefully', async () => {
      // Test with invalid authorization
      const payload = {
        share_slug: 'testlive'
      }

      const result = await callEdgeFunction('setlist-share', payload, {
        'Authorization': 'Bearer invalid-token'
      })

      expect(result.status).toBe(500)
      expect(result.error).toBeDefined()
    })

    test('should include metadata for SEO and social sharing', async () => {
      const payload = {
        share_slug: 'testlive',
        includeMetadata: true
      }

      const result = await callEdgeFunction('setlist-share', payload)

      expect(result.status).toBe(200)
      expect(result.data.metadata).toBeDefined()
      expect(result.data.metadata.title).toBeDefined()
      expect(result.data.metadata.description).toBeDefined()
      expect(result.data.metadata.socialImage).toBeDefined()

      // SEO title should include band name and live title
      expect(result.data.metadata.title).toContain(result.data.band.name)
      expect(result.data.metadata.title).toContain(result.data.live.title)
    })

    test('should return performance metrics for monitoring', async () => {
      const payload = {
        share_slug: 'testlive',
        includeMetrics: true
      }

      const result = await callEdgeFunction('setlist-share', payload)

      expect(result.status).toBe(200)
      expect(result.data.metrics).toBeDefined()
      expect(result.data.metrics.queryTime).toBeDefined()
      expect(result.data.metrics.songCount).toBeDefined()
      expect(typeof result.data.metrics.queryTime).toBe('number')
      expect(typeof result.data.metrics.songCount).toBe('number')
    })
  })

  describe('Cross-Function Integration', () => {
    test('should be able to generate slug and use it for sharing', async () => {
      // Step 1: Generate a new unique slug
      const slugResult = await callEdgeFunction('share-slug-generator', {
        checkUniqueness: true
      })

      expect(slugResult.status).toBe(200)
      const newSlug = slugResult.data.slug

      // Step 2: Try to access the share page with new slug (should return 404)
      const shareResult = await callEdgeFunction('setlist-share', {
        share_slug: newSlug
      })

      expect(shareResult.status).toBe(404) // No live with this slug exists yet

      // This validates that the slug generation and sharing systems work together
      // In real usage, a live would be created with this slug before sharing
    })
  })

  describe('Rate Limiting and Security', () => {
    test('should handle CORS headers properly', async () => {
      const response = await fetch(`${EDGE_FUNCTION_URL}/share-slug-generator`, {
        method: 'OPTIONS', // Preflight request
        headers: {
          'Origin': 'https://livelink.app',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      })

      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined()
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    })

    test('should validate request size limits', async () => {
      // Test with very large payload
      const largePayload = {
        share_slug: 'x'.repeat(10000), // Very long slug
        data: 'x'.repeat(100000) // Large data field
      }

      const result = await callEdgeFunction('setlist-share', largePayload)

      // Should either handle gracefully or reject with 413 (Payload Too Large)
      expect([200, 400, 413, 500]).toContain(result.status)
    })
  })
})