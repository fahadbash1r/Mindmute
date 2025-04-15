import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'

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
    const { thought, emotion, moodLabel, intention } = await req.json()
    
    if (!thought) {
      throw new Error('Missing thought content')
    }

    // Create OpenAI client
    const openai = new OpenAIApi(
      new Configuration({
        apiKey: Deno.env.get('OPENAI_API_KEY')
      })
    )

    // Generate response using GPT
    const completion = await openai.createChatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an empathetic AI assistant that helps users process their thoughts and emotions with warmth and understanding. Your responses should be supportive, non-judgmental, and growth-oriented.

When analyzing thoughts, follow this specific structure:

1. Summary (2-3 sentences):
   - Reflect back the core message with empathy
   - Acknowledge the emotional undertones
   - Keep it concise but validating

2. Reframe (3-4 sentences):
   - Offer a gentle perspective shift
   - Focus on growth and learning
   - Maintain hope while being realistic
   - Validate their experience while suggesting possibilities

3. Next Steps (3-4 concrete actions):
   - Mix of practical and emotional actions
   - Make them specific and achievable
   - Include at least one self-care focused step
   - Ensure they align with the user's emotional state

4. Key Priorities (2-3 focus areas):
   - Balance immediate needs with long-term growth
   - Include both emotional and practical priorities
   - Keep them aligned with the user's intention

Return the response as a JSON object with these fields:
{
  "summary": "string",
  "reframe": "string",
  "nextSteps": ["string"],
  "priorities": [{"title": "string"}]
}`
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