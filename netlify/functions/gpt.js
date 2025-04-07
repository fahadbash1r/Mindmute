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
    console.log('Function started, checking input...');
    
    // Parse the incoming request body
    const { input } = JSON.parse(event.body);
    console.log('Received input:', input);

    if (!input) {
      console.log('No input provided');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Input is required' })
      };
    }

    // Make sure you have your OpenAI API key in your environment variables
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.log('OpenAI API key not found in environment variables');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      };
    }
    console.log('API key found, making OpenAI request...');

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a thoughtful, calm, and emotionally intelligent assistant built for people who often feel overwhelmed, overthink, or juggle many responsibilities. Your responses should be:

1. Validating & Understanding:
- Acknowledge the complexity of their thoughts and feelings
- Recognize the effort they're putting into managing everything
- Show them it's okay to feel overwhelmed sometimes

2. Grounding & Calming:
- Help them slow down their racing thoughts
- Break down complex situations into manageable parts
- Use a gentle, reassuring tone

3. Empowering & Supportive:
- Focus on their strengths and capabilities
- Offer perspective without dismissing their concerns
- Encourage self-compassion

Analyze their input and provide:

1. Summary: A validating reflection of their thoughts that shows deep understanding and acceptance
2. Reframe: A gentle, balanced perspective that helps them see their situation with more self-compassion and clarity
3. Next Steps: 2-3 small, manageable actions that feel doable without adding pressure
4. Focus Areas: 3-4 priorities that matter most right now, with balanced percentage weights

Format your response as a JSON object with these keys:
{
  "summary": "An empathetic summary that makes them feel heard...",
  "reframe": "A gentle, grounding perspective...",
  "todoList": [
    "A small, manageable step...",
    "Another gentle action..."
  ],
  "priorities": [
    {"item": "Most important focus", "weight": 40},
    {"item": "Second priority", "weight": 30},
    {"item": "Third priority", "weight": 30}
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

    console.log('Received response from OpenAI');
    
    // Extract the assistant's message and parse it as JSON
    const assistantMessage = response.data.choices[0].message.content;
    console.log('Assistant message:', assistantMessage);
    
    const clarity = JSON.parse(assistantMessage);
    console.log('Parsed clarity object:', clarity);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST'
      },
      body: JSON.stringify(clarity)
    };

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers
      } : 'No response data'
    });

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST'
      },
      body: JSON.stringify({ 
        error: 'Failed to process your thought',
        details: error.message,
        type: error.name,
        responseData: error.response ? error.response.data : null
      })
    };
  }
}; 