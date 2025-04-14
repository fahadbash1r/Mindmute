import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { thought, emotion, mood_label } = await req.json()

    // Create OpenAI client
    const openai = new OpenAIApi(
      new Configuration({
        apiKey: Deno.env.get('OPENAI_API_KEY'),
      })
    )

    // Generate tasks using GPT
    const completion = await openai.createChatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a supportive AI assistant that generates personalized tasks to help users process their thoughts and emotions. 
          Create 3-4 actionable tasks based on the user's thought and emotional state.
          Each task should be categorized as either 'emotional', 'mental', 'practical', or 'clarity'.
          Return the tasks in JSON format with fields: description, type, and optional (boolean).
          Tasks should be specific, actionable, and directly related to the user's thought content.`
        },
        {
          role: 'user',
          content: `Thought: "${thought}"
          Emotional state: ${mood_label} (score: ${emotion})`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const tasks = JSON.parse(completion.data.choices[0].message.content)

    return new Response(
      JSON.stringify(tasks.tasks),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 