const axios = require('axios');

exports.handler = async function(event, context) {
  // Log the entire event object for debugging
  console.log('Function invoked with event:', JSON.stringify(event, null, 2));
  
  // Debug: Log environment variable (will be masked in logs)
  console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
  console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length);
  console.log('OPENAI_API_KEY starts with sk-:', process.env.OPENAI_API_KEY?.startsWith('sk-'));
  console.log('OPENAI_API_KEY first 10 chars:', process.env.OPENAI_API_KEY?.substring(0, 10));
  console.log('OPENAI_API_KEY last 10 chars:', process.env.OPENAI_API_KEY?.substring(process.env.OPENAI_API_KEY?.length - 10));
  console.log('OPENAI_API_KEY contains special chars:', {
    hasUnderscore: process.env.OPENAI_API_KEY?.includes('_'),
    hasHyphen: process.env.OPENAI_API_KEY?.includes('-'),
    hasSpace: process.env.OPENAI_API_KEY?.includes(' '),
    hasNewline: process.env.OPENAI_API_KEY?.includes('\n')
  });
  console.log('All environment variables:', Object.keys(process.env));
  
  // Validate API key format and test with OpenAI API
  // First check if key exists and has correct format
  const apiKey = process.env.OPENAI_API_KEY?.trim(); // Trim any whitespace
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  
  // Log the first 10 characters of the API key for debugging
  console.log('API Key prefix:', apiKey.substring(0, 10));
  console.log('API Key length:', apiKey.length);
  if (!apiKey.startsWith('sk-')) {
    throw new Error('OPENAI_API_KEY must start with "sk-"');
  }
  
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

    // Test the API key with a simple request first
    try {
      console.log('Testing API key with OpenAI models endpoint...');
      const testResponse = await axios.get('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      });
      console.log('API key test successful:', testResponse.data);
    } catch (testError) {
      console.error('API key test failed:', testError.response?.data || testError.message);
      throw new Error('API key validation failed: ' + (testError.response?.data?.error?.message || testError.message));
    }

    // Debug: Log the request configuration (without the API key)
    const requestConfig = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: body.input
        }
      ],
      max_tokens: 100,
    };
    console.log('Request configuration:', requestConfig);

    // Make the OpenAI API request
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      requestConfig,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
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
        clarity: response.data.choices[0].message.content.trim(),
        success: true 
      })
    };
  } catch (error) {
    console.error('Function error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
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