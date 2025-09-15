/**
 * Setlist Share Edge Function
 * Provides public API for sharing setlists via share_slug
 * Implements TDD-driven requirements
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface ShareRequest {
  share_slug: string
  includeMetadata?: boolean
  includeMetrics?: boolean
}

interface ShareResponse {
  live: {
    id: string
    title: string
    date: string
    venue: string
    is_upcoming: boolean
    share_slug: string
  }
  band: {
    id: string
    name: string
    description: string | null
    avatar_url: string | null
  }
  setlist: Array<{
    id: string
    order_index: number
    song: {
      id: string
      title: string
      artist: string
      youtube_url: string | null
      spotify_url: string | null
    }
  }>
  metadata?: {
    title: string
    description: string
    socialImage: string
  }
  metrics?: {
    queryTime: number
    songCount: number
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = performance.now()

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Parse request
    const requestBody: ShareRequest = req.method === 'POST' && req.body
      ? await req.json()
      : {}

    const { share_slug, includeMetadata = false, includeMetrics = false } = requestBody

    // Validate required parameters
    if (!share_slug) {
      return new Response(
        JSON.stringify({ error: 'share_slug parameter is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
        }
      )
    }

    // Query live with band information
    const { data: liveData, error: liveError } = await supabase
      .from('lives')
      .select(`
        id,
        title,
        date,
        venue,
        is_upcoming,
        share_slug,
        bands (
          id,
          name,
          description,
          avatar_url
        )
      `)
      .eq('share_slug', share_slug)
      .single()

    if (liveError || !liveData) {
      return new Response(
        JSON.stringify({ error: 'Setlist not found or not publicly shared' }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
        }
      )
    }

    // Query setlist items with song details
    const { data: setlistData, error: setlistError } = await supabase
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
      .eq('live_id', liveData.id)
      .order('order_index', { ascending: true })

    if (setlistError) {
      console.error('Error fetching setlist:', setlistError)
      return new Response(
        JSON.stringify({ error: 'Failed to load setlist data' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
        }
      )
    }

    // Build response
    const response: ShareResponse = {
      live: {
        id: liveData.id,
        title: liveData.title,
        date: liveData.date,
        venue: liveData.venue,
        is_upcoming: liveData.is_upcoming,
        share_slug: liveData.share_slug
      },
      band: {
        id: liveData.bands.id,
        name: liveData.bands.name,
        description: liveData.bands.description,
        avatar_url: liveData.bands.avatar_url
      },
      setlist: (setlistData || []).map(item => ({
        id: item.id,
        order_index: item.order_index,
        song: {
          id: item.songs.id,
          title: item.songs.title,
          artist: item.songs.artist,
          youtube_url: item.songs.youtube_url,
          spotify_url: item.songs.spotify_url
        }
      }))
    }

    // Add metadata if requested
    if (includeMetadata) {
      const songCount = response.setlist.length
      const songList = response.setlist.slice(0, 3).map(item => item.song.title).join(', ')
      const moreText = songCount > 3 ? ` and ${songCount - 3} more` : ''

      response.metadata = {
        title: `${response.band.name} - ${response.live.title} Setlist`,
        description: `Live at ${response.live.venue} on ${new Date(response.live.date).toLocaleDateString()}. ${songCount} songs: ${songList}${moreText}`,
        socialImage: `https://livelink.app/api/social-image/${share_slug}`
      }
    }

    // Add metrics if requested
    if (includeMetrics) {
      const queryTime = Math.round((performance.now() - startTime) * 100) / 100
      response.metrics = {
        queryTime,
        songCount: response.setlist.length
      }
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        },
      }
    )

  } catch (error) {
    console.error('Error in setlist-share function:', error)

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
      }
    )
  }
})