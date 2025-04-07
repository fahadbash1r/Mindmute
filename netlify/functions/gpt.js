const axios = require('axios');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the incoming request body
    const { input } = JSON.parse(event.body);

    if (!input) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Input is required' })
      };
    }

    // Make sure you have your OpenAI API key in your environment variables
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      };
    }

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a thoughtful AI assistant that helps users process their thoughts and feelings. 
            Analyze the user's input and provide:
            1. A concise summary of their thoughts
            2. A reframed perspective that's more balanced and constructive
            3. A practical todo list with 2-3 actionable items
            4. A list of 3-4 priorities to focus on, with percentage weights that add up to 100%
            
            Format your response as a JSON object with these keys:
            {
              "summary": "brief summary",
              "reframe": "reframed perspective",
              "todoList": ["item1", "item2", "item3"],
              "priorities": [
                {"item": "priority1", "weight": 40},
                {"item": "priority2", "weight": 30},
                {"item": "priority3", "weight": 30}
              ]
            }`
          },
          {
            role: 'user',
            content: input
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the assistant's message and parse it as JSON
    const assistantMessage = response.data.choices[0].message.content;
    const clarity = JSON.parse(assistantMessage);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clarity)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process your thought',
        details: error.message
      })
    };
  }
}; 