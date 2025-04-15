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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const { thought, emotion, mood_label } = JSON.parse(event.body);
    
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
          content: `You are a supportive AI assistant that helps users break down their thoughts into actionable tasks.
          Based on the user's thought and emotional state, generate 3-4 tasks that will help them move forward.
          
          For each task:
          1. Make it specific and actionable
          2. Consider their emotional state
          3. Include a mix of practical and emotional tasks
          4. Some tasks can be marked as optional for self-care
          
          Each task should have these properties:
          - task: The actual task description
          - type: One of ['emotional', 'mental', 'practical', 'clarity', 'custom']
          - optional: boolean (true for self-care or bonus tasks)
          
          Return an array of task objects in this format:
          [
            {
              "task": "string",
              "type": "string",
              "optional": boolean
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
    });

    const responseContent = completion.data.choices[0].message.content;
    console.log('GPT response:', responseContent);

    // Parse and validate the response
    let tasks;
    try {
      tasks = JSON.parse(responseContent);
      if (!Array.isArray(tasks) || !tasks.every(task => 
        task.task && 
        task.type && 
        typeof task.optional === 'boolean'
      )) {
        throw new Error('Invalid response format');
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
      body: JSON.stringify(tasks)
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