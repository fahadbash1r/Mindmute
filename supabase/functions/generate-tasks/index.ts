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
          content: `You are an empathetic AI assistant that creates a focused Daily Clarity Plan to help users improve by 1% each day.
          
          Guidelines for generating clarity steps:
          1. Generate EXACTLY 5 clarity steps that form a cohesive daily plan
          2. Each step should:
             - Be gentle and achievable
             - Focus on small, 1% improvements
             - Match their emotional state
             - Lead to meaningful progress
          3. Steps should follow this structure:
             - Step 1: Morning reflection (type: reflect)
             - Step 2: Understanding patterns (type: understand)
             - Step 3: Small action step (type: act)
             - Step 4: Mindful practice (type: reflect)
             - Step 5: Growth action (type: act)
          
          Return EXACTLY 5 steps as a JSON array where each step has:
          - task (string): Clear, actionable step description
          - type (string): Either 'reflect', 'understand', or 'act'
          - optional (boolean): Whether the step is optional (max 2 optional steps)`
        },
        {
          role: 'user',
          content: `Based on this thought: "${thought}"
          Current emotional state: ${emotion}/100 (${mood_label || 'neutral'})
          
          Create a Daily Clarity Plan with exactly 5 steps that will help them improve by 1% today while being mindful of their emotional state.`
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

    // Delete all existing tasks for this user before adding new ones
    const { error: deleteError } = await supabaseClient
      .from('tasks')
      .delete()
      .eq('user_id', req.headers.get('x-user-id'))

    if (deleteError) {
      throw deleteError
    }

    // Validate we have exactly 5 tasks
    if (!Array.isArray(tasks) || tasks.length !== 5) {
      throw new Error('Invalid number of tasks generated. Expected exactly 5 tasks.')
    }

    // Save new tasks
    const { error: insertError } = await supabaseClient
      .from('tasks')
      .insert(
        tasks.map(task => ({
          user_id: req.headers.get('x-user-id'),
          task: task.task,
          type: task.type,
          optional: task.optional,
          created_at: new Date().toISOString()
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