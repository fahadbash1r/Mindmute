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
          content: `You are an empathetic AI assistant that generates personalized tasks based on users' thoughts and emotional state.
          
          Guidelines for task generation:
          1. Generate exactly 3-5 tasks that are meaningful and actionable
          2. Tasks should focus on emotional well-being and personal growth
          3. Each task should be categorized as one of:
             - 'emotional' (for feelings and self-reflection)
             - 'mental' (for mindset and thought patterns)
             - 'practical' (for concrete actions that improve mood)
          4. Make tasks specific and achievable within a day
          5. Consider the user's current emotional state when suggesting tasks
          
          Return tasks as a JSON array where each task has:
          - task (string): The task description
          - type (string): The category (emotional/mental/practical)
          - optional (boolean): Whether the task is optional`
        },
        {
          role: 'user',
          content: `Based on this thought: "${thought}"
          Current emotional state: ${emotion}/100 (${mood_label || 'neutral'})
          
          Generate 3-5 personalized tasks that will help them process their thoughts and improve their emotional well-being.`
        }
      ],
      temperature: 0.8,
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