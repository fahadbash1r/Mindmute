import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    // Verify request has proper authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const body = await req.json()
    const { thought, emotion, mood_label } = body
    console.log('Processing request:', { thought, emotion, mood_label })

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

      // Validate each task has required fields
      tasks = tasks.map(task => ({
        description: task.description || task.task || 'Reflect on your progress',
        type: task.type || 'mental',
        optional: task.optional || false
      }))
    } catch (error) {
      console.error('Error parsing GPT response:', error)
      throw new Error('Invalid response format from GPT')
    }

    console.log('Parsed and validated tasks:', tasks)

    return new Response(
      JSON.stringify(tasks),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message.includes('authorization') ? 401 : 500
      }
    )
  }
}) 