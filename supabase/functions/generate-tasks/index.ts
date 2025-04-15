import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request data
    const { thought, emotion, mood_label } = await req.json()
    
    // Create OpenAI client
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    // Generate tasks using GPT
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that generates actionable tasks based on user thoughts and emotions. 
          Each task should be categorized as either 'emotional', 'mental', or 'practical'.
          Some tasks can be marked as optional if they're not critical but could be helpful.
          Return the tasks as a JSON array with each task having: task (string), type (string), optional (boolean).`
        },
        {
          role: 'user',
          content: `Generate 3-5 helpful tasks based on this thought: "${thought}". 
          Emotion level: ${emotion}/100. Mood: ${mood_label || 'neutral'}`
        }
      ],
      temperature: 0.7,
    })

    const responseText = completion.data.choices[0].message?.content
    if (!responseText) {
      throw new Error('No response from GPT')
    }

    // Parse tasks from GPT response
    const tasks = JSON.parse(responseText)
    if (!Array.isArray(tasks)) {
      throw new Error('Invalid response format from GPT')
    }

    // Save tasks to database
    const { error: insertError } = await supabaseClient
      .from('tasks')
      .insert(
        tasks.map(task => ({
          user_id: req.headers.get('x-user-id'),
          task: task.task,
          type: task.type,
          optional: task.optional,
          source_thought: thought
        }))
      )

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({ tasks }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 