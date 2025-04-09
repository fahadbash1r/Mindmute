const axios = require('axios');

exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Parse input
    let thought;
    try {
      const body = JSON.parse(event.body);
      thought = body.thought;
    } catch (e) {
      console.error('Error parsing request body:', e);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request format' })
      };
    }

    if (!thought) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No thought provided' })
      };
    }

    // Make API call
    const response = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a supportive AI assistant helping users process their thoughts and emotions. 
            Provide responses in the following JSON structure:
            {
              "summary": "Brief 2-3 sentence summary of their thought",
              "reframe": "Positive 2-3 sentence reframing of their perspective",
              "nextSteps": ["2-3 actionable steps"],
              "priorities": [
                {
                  "title": "Priority 1",
                  "description": "Brief description",
                  "motivation": "Unique motivational message (10-15 words)"
                },
                {
                  "title": "Priority 2",
                  "description": "Brief description",
                  "motivation": "Unique motivational message (10-15 words)"
                },
                {
                  "title": "Priority 3",
                  "description": "Brief description",
                  "motivation": "Unique motivational message (10-15 words)"
                }
              ]
            }`
          },
          {
            role: "user",
            content: thought
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      },
      timeout: 30000
    });

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      console.error('Invalid response from OpenAI:', response.data);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Invalid response from AI service' })
      };
    }

    let parsedResponse;
    try {
      // Parse the response content
      parsedResponse = JSON.parse(response.data.choices[0].message.content.trim());
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      console.error('Raw response:', response.data.choices[0].message.content);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Error processing AI response' })
      };
    }

    // Validate response structure
    const requiredFields = ['summary', 'reframe', 'nextSteps', 'priorities'];
    for (const field of requiredFields) {
      if (!parsedResponse[field]) {
        console.error(`Missing required field: ${field}`);
        return {
          statusCode: 502,
          headers,
          body: JSON.stringify({ error: 'Incomplete response from AI service' })
        };
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(parsedResponse)
    };

  } catch (error) {
    console.error('Error processing request:', error);

    // Handle specific error types
    if (error.response) {
      // OpenAI API error
      console.error('OpenAI API error:', error.response.data);
      return {
        statusCode: error.response.status,
        headers,
        body: JSON.stringify({ error: 'AI service error. Please try again.' })
      };
    }

    if (error.code === 'ECONNABORTED') {
      return {
        statusCode: 504,
        headers,
        body: JSON.stringify({ error: 'Request timed out. Please try again.' })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'An unexpected error occurred. Please try again.' })
    };
  }
}; 