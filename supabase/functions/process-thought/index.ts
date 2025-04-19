import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { thought, emotion, moodLabel, intention, userId } = await req.json()
    
    if (!thought || !userId) {
      throw new Error('Missing required fields')
    }

    // Create OpenAI client
    const openai = new OpenAIApi(
      new Configuration({
        apiKey: Deno.env.get('OPENAI_API_KEY')
      })
    )

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Fetch user preferences from profiles
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('mood, challenge, clarity_area, spin_frequency, desired_outcome, daily_time, tone_preference')
      .eq('id', userId)
      .single()

    if (profileError) {
      throw new Error('Failed to fetch user preferences')
    }

    // Create a personalized system message based on user preferences
    const personalizedSystemMessage = `You are an empathetic AI assistant that helps users process their thoughts and emotions with warmth and understanding. Your responses should be supportive, non-judgmental, and growth-oriented.

Based on the user's profile:
- They typically feel: ${userProfile.mood}
- Their main challenge is: ${userProfile.challenge}
- They seek clarity in: ${userProfile.clarity_area}
- Thoughts spin out: ${userProfile.spin_frequency}
- They want to achieve: ${userProfile.desired_outcome}
- They can spend: ${userProfile.daily_time}
- They prefer a ${userProfile.tone_preference} tone

When analyzing thoughts, follow this specific structure:

1. Summary (2-3 sentences):
   - Reflect back the core message with empathy
   - Acknowledge the emotional undertones
   - Keep it concise but validating

2. Reframe (3-4 sentences):
   - Offer a gentle perspective shift that aligns with their desired outcome
   - Focus on growth and learning
   - Maintain hope while being realistic
   - Validate their experience while suggesting possibilities

3. Next Steps (3-4 concrete actions):
   - Mix of practical and emotional actions
   - Make them specific and achievable within their available time (${userProfile.daily_time})
   - Include at least one self-care focused step
   - Ensure they align with the user's emotional state and challenges

4. Key Priorities (2-3 focus areas):
   - Balance immediate needs with long-term growth
   - Include both emotional and practical priorities
   - Keep them aligned with the user's intention and clarity goals

Return the response as a JSON object with these fields:
{
  "summary": "string",
  "reframe": "string",
  "nextSteps": ["string"],
  "priorities": [{"title": "string"}]
}`

    // Generate response using GPT
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: personalizedSystemMessage
        },
        {
          role: 'user',
          content: `Thought: "${thought}"
          Emotional state: ${moodLabel} (score: ${emotion})
          Intention: ${intention}`
        }
      ],
      temperature: 0.7
    })

    const responseContent = completion.data.choices[0].message.content
    console.log('GPT response:', responseContent)

    // Parse and validate the response
    let response
    try {
      response = JSON.parse(responseContent)
      if (!response.summary || !response.reframe || !response.nextSteps || !response.priorities) {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error parsing GPT response:', error)
      throw new Error('Invalid response format from GPT')
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
}) 