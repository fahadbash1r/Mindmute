const axios = require('axios');

exports.handler = async function(event, context) {
  // Log the entire event object for debugging
  console.log('Function invoked with event:', JSON.stringify(event, null, 2));
  
  // Debug: Log environment variable (will be masked in logs)
  console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
  
  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body);
    console.log('Request body:', body);

    if (!body.input) {
      throw new Error('No input provided');
    }

    // Debug: Log the request configuration (without the API key)
    const requestConfig = {
      model: "text-davinci-003",
      prompt: body.input,
      max_tokens: 100,
    };
    console.log('Request configuration:', requestConfig);

    // Make the OpenAI API request
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      requestConfig,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('OpenAI API response:', response.data);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        clarity: response.data.choices[0].text.trim(),
        success: true 
      })
    };
  } catch (error) {
    console.error('Function error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Error processing request',
        details: error.message,
        success: false
      })
    };
  }
};
