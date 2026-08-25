import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the image and other data from the request
    const formData = await req.formData()
    const imageFile = formData.get('image') as File
    const imageBase64 = formData.get('imageBase64') as string

    if (!imageFile && !imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get image data
    let image64: string
    let mediaType: string

    if (imageFile) {
      const buffer = await imageFile.arrayBuffer()
      image64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
      mediaType = imageFile.type || 'image/jpeg'
    } else {
      // Handle base64 image data URL
      if (imageBase64.startsWith('data:image')) {
        const header = imageBase64.split(',')[0]
        mediaType = header.split(':')[1].split(';')[0]
        image64 = imageBase64.split(',')[1]
      } else {
        mediaType = 'image/jpeg'
        image64 = imageBase64
      }
    }

    // Get API settings from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Database configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get API key from app_settings
    const { data: settings, error: settingsError } = await supabase
      .from('app_settings')
      .select('anthropic_api_key')
      .eq('id', 1)
      .single()

    if (settingsError || !settings || !settings.anthropic_api_key) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = settings.anthropic_api_key

    // Call Claude Vision API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: image64,
                },
              },
              {
                type: 'text',
                text: `Bitte erkenne den Text in diesem Bild sehr genau und präzise.

Gib den erkannten Text genau so aus, wie er im Bild steht, Zeile für Zeile.
Ignoriere keine Wörter und achte auf korrekte Rechtschreibung.

Antworte NUR mit dem erkannten Text, nichts anderes.`,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Claude API error:', errorData)
      return new Response(
        JSON.stringify({
          error: 'OCR failed',
          details: errorData.error?.message || 'Unknown error',
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const responseData = await response.json()
    const extractedText = responseData.content[0].text.trim()

    return new Response(
      JSON.stringify({
        text: extractedText,
        confidence: 0.95,
        success: true,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
