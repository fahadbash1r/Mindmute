const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

exports.handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { thought, emotion, moodLabel, intention } = JSON.parse(event.body);
    
    if (!thought) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing thought content' })
      };
    }

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

5. Tasks (3-4 actionable items):
   - Each task should be specific and achievable
   - Include a mix of emotional and practical tasks
   - Some tasks can be marked as optional for self-care
   - Each task should have a type: 'emotional', 'mental', 'practical', 'clarity', or 'custom'

Return the response as a JSON object with these fields:
{
  "summary": "string",
  "reframe": "string",
  "nextSteps": ["string"],
  "priorities": [{"title": "string"}],
  "tasks": [
    {
      "task": "string",
      "type": "string",
      "optional": boolean
    }
  ]
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
    });

    const responseContent = completion.data.choices[0].message.content;
    console.log('GPT response:', responseContent);

    // Parse and validate the response
    let response;
    try {
      response = JSON.parse(responseContent);
      if (!response.summary || !response.reframe || !response.nextSteps || !response.priorities || !response.tasks) {
        throw new Error('Invalid response format');
      }
      // Validate tasks format
      if (!Array.isArray(response.tasks) || !response.tasks.every(task => 
        task.task && 
        task.type && 
        typeof task.optional === 'boolean'
      )) {
        throw new Error('Invalid tasks format');
      }
    } catch (error) {
      console.error('Error parsing GPT response:', error);
      throw new Error('Invalid response format from GPT');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
}; 