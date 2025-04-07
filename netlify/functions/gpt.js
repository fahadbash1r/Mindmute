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

    try {
      // Call OpenAI API with timeout
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

1. Summary: A clear, concise reflection of their core message in 1-2 sentences (max 50 words). Focus on the main feeling or challenge they're expressing.
2. Reframe: A gentle, balanced perspective that helps them see their situation with more self-compassion and clarity
3. Next Steps: 2-3 small, manageable actions that feel doable without adding pressure
4. Focus Areas: 3-4 priorities that matter most right now, with balanced percentage weights. Each priority should include a short, specific motivational message that relates directly to that priority's focus.

Format your response as a JSON object with these keys:
{
  "summary": "A brief 1-2 sentence summary of their core message...",
  "reframe": "A gentle, grounding perspective...",
  "todoList": [
    "A small, manageable step...",
    "Another gentle action..."
  ],
  "priorities": [
    {
      "item": "Most important focus",
      "weight": 40,
      "motivation": "A specific encouraging message related to this priority..."
    },
    {
      "item": "Second priority",
      "weight": 30,
      "motivation": "Different encouraging message for this specific focus..."
    },
    {
      "item": "Third priority",
      "weight": 30,
      "motivation": "Unique motivation related to this particular priority..."
    }
  ]
}

Example priority motivations:
- For "Understanding emotions": "Your feelings are valid and worthy of attention. Take time to listen to yourself."
- For "Building support network": "Reaching out shows strength. Each connection makes your foundation stronger."
- For "Taking small steps": "Progress isn't about speed - it's about moving forward in your own way."
- For "Self-care practices": "Making time for yourself isn't selfish - it's essential for your wellbeing."
- For "Professional growth": "Focus on your own path. Small improvements add up to big changes."
- For "Relationship building": "Quality connections take time. Be patient with the process."

Keep motivational messages short (10-15 words), specific to the priority, and genuinely encouraging.

IMPORTANT: Make sure your response is valid JSON. Double-check that all quotes are properly escaped and the structure is correct.`
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
          },
          timeout: 30000 // 30 second timeout
        }
      );

      console.log('Received response from OpenAI');
      
      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        console.error('Invalid response structure from OpenAI:', response.data);
        throw new Error('Invalid response from OpenAI API');
      }
      
      // Extract the assistant's message and parse it as JSON
      const assistantMessage = response.data.choices[0].message.content;
      console.log('Assistant message:', assistantMessage);
      
      // Validate JSON before parsing
      try {
        const clarity = JSON.parse(assistantMessage);
        console.log('Parsed clarity object:', clarity);

        // Validate the structure
        if (!clarity.summary || !clarity.reframe || !clarity.todoList || !clarity.priorities) {
          throw new Error('Response missing required fields');
        }

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
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Invalid JSON response:', assistantMessage);
        throw new Error('Failed to parse OpenAI response as JSON');
      }
    } catch (apiError) {
      console.error('OpenAI API Error:', {
        message: apiError.message,
        response: apiError.response?.data,
        status: apiError.response?.status
      });
      
      // Check for specific error types
      if (apiError.code === 'ECONNABORTED') {
        return {
          statusCode: 504,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            error: 'Request timeout',
            details: 'The request to process your thought took too long. Please try again.'
          })
        };
      }
      
      if (apiError.response?.status === 401) {
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            error: 'API authentication failed',
            details: 'There was an issue with the API key. Please contact support.'
          })
        };
      }

      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'OpenAI API error',
          details: apiError.message,
          response: apiError.response?.data
        })
      };
    }

  } catch (error) {
    console.error('General Error:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
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
        type: error.constructor.name
      })
    };
  }
}; 