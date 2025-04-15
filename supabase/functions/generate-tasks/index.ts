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
          content: `You are an empathetic AI assistant that creates a Daily Clarity Plan based on users' thoughts and emotional state.
          
          Guidelines for generating clarity steps:
          1. Generate exactly 3-5 clarity steps that are broad yet meaningful
          2. Each step should be:
             - Gentle and non-prescriptive
             - Focused on self-reflection and awareness
             - Adaptable to different emotional states
             - Actionable within a day
          3. Steps should follow a natural progression:
             - Starting with self-reflection
             - Moving to understanding
             - Ending with gentle action
          
          Return steps as a JSON array where each step has:
          - step (string): The clarity step description
          - type (string): Either 'reflect', 'understand', or 'act'
          - optional (boolean): Whether the step is optional`
        },
        {
          role: 'user',
          content: `Based on this thought: "${thought}"
          Current emotional state: ${emotion}/100 (${mood_label || 'neutral'})
          
          Create 3-5 clarity steps for their Daily Clarity Plan that will help them process their thoughts and find mental clarity.`
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
          source_thought: thought,
          created_at: new Date().toISOString()
        }))
      )

    if (insertError) {
      throw insertError
    }

    // Return only the most recent 5 tasks
    const { data: latestTasks, error: fetchError } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', req.headers.get('x-user-id'))
      .order('created_at', { ascending: false })
      .limit(5)

    if (fetchError) {
      throw fetchError
    }

    return new Response(
      JSON.stringify({ tasks: latestTasks }),
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