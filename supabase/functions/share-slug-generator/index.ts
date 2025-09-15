/**
 * Share Slug Generator Edge Function
 * Generates unique slugs for public sharing of setlists
 * Implements TDD-driven requirements
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface GenerateSlugRequest {
  checkUniqueness?: boolean
  excludeSlug?: string
  length?: number
}

interface GenerateSlugResponse {
  slug: string
  isUnique?: boolean
  fallbackMode?: boolean
}

// Generate random slug with specified length
function generateRandomSlug(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Check if slug is unique in the database
async function checkSlugUniqueness(supabase: any, slug: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('lives')
      .select('id')
      .eq('share_slug', slug)
      .limit(1)

    if (error) {
      console.error('Database error checking slug uniqueness:', error)
      return false // Assume not unique on error to be safe
    }

    return !data || data.length === 0
  } catch (error) {
    console.error('Exception checking slug uniqueness:', error)
    return false
  }
}

// Generate unique slug with database validation
async function generateUniqueSlug(
  supabase: any,
  excludeSlug?: string,
  maxAttempts: number = 10
): Promise<{ slug: string; isUnique: boolean; fallbackMode: boolean }> {
  let attempts = 0
  let fallbackMode = false

  while (attempts < maxAttempts) {
    const slug = generateRandomSlug()

    // Skip if this is the excluded slug
    if (excludeSlug && slug === excludeSlug) {
      attempts++
      continue
    }

    try {
      const isUnique = await checkSlugUniqueness(supabase, slug)
      if (isUnique) {
        return { slug, isUnique: true, fallbackMode }
      }
    } catch (error) {
      console.warn('Database check failed, enabling fallback mode:', error)
      fallbackMode = true
      // In fallback mode, just return a random slug without database check
      return { slug, isUnique: true, fallbackMode: true }
    }

    attempts++
  }

  // If all attempts failed, return the last generated slug in fallback mode
  const fallbackSlug = generateRandomSlug()
  return { slug: fallbackSlug, isUnique: false, fallbackMode: true }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Parse request
    const requestBody: GenerateSlugRequest = req.method === 'POST' && req.body
      ? await req.json()
      : {}

    const {
      checkUniqueness = false,
      excludeSlug,
      length = 8
    } = requestBody

    let response: GenerateSlugResponse

    if (checkUniqueness) {
      // Generate unique slug with database validation
      const result = await generateUniqueSlug(supabase, excludeSlug)
      response = {
        slug: result.slug,
        isUnique: result.isUnique,
        fallbackMode: result.fallbackMode
      }
    } else {
      // Simple random slug generation without database check
      const slug = generateRandomSlug(length)
      response = { slug }
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
      }
    )

  } catch (error) {
    console.error('Error in share-slug-generator function:', error)

    // Return fallback response even on error
    const fallbackSlug = generateRandomSlug()
    const errorResponse: GenerateSlugResponse = {
      slug: fallbackSlug,
      fallbackMode: true
    }

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 200, // Still return 200 with fallback
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
      }
    )
  }
})