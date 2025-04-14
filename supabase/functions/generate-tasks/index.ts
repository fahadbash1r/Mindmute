import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Get the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '')
    
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the user's JWT
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      throw new Error('Invalid authorization')
    }

    // Parse request body
    const { thought, emotion, mood_label } = await req.json()
    console.log('Processing request:', { thought, emotion, mood_label, userId: user.id })

    if (!thought) {
      throw new Error('Missing thought content')
    }

    // Create OpenAI client
    const openai = new OpenAIApi(
      new Configuration({
        apiKey: Deno.env.get('OPENAI_API_KEY')
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
          Tasks should be specific, actionable, and directly related to the user's thought content.
          Return ONLY a JSON array of tasks with each task having: description (string), type (string), and optional (boolean).
          Example format:
          [
            {
              "description": "Take 5 deep breaths and ground yourself",
              "type": "emotional",
              "optional": false
            }
          ]`
        },
        {
          role: 'user',
          content: `Thought: "${thought}"
          Emotional state: ${mood_label} (score: ${emotion})`
        }
      ],
      temperature: 0.7
    })

    const responseContent = completion.data.choices[0].message.content
    console.log('GPT response:', responseContent)

    // Parse and validate the response
    let tasks
    try {
      tasks = JSON.parse(responseContent)
      if (!Array.isArray(tasks)) {
        throw new Error('Response is not an array')
      }

      // Validate and normalize each task
      tasks = tasks.map(task => ({
        task: task.description || task.task,
        type: ['emotional', 'mental', 'practical', 'clarity'].includes(task.type) ? task.type : 'mental',
        optional: Boolean(task.optional),
        user_id: user.id
      }))
    } catch (error) {
      console.error('Error parsing GPT response:', error)
      throw new Error('Invalid response format from GPT')
    }

    console.log('Normalized tasks:', tasks)

    return new Response(
      JSON.stringify(tasks),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message.includes('authorization') ? 401 : 500
      }
    )
  }
}) 