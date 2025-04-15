const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event) => {
  // Handle CORS preflight
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

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse and validate input
    const { thought, emotion, moodLabel } = JSON.parse(event.body);
    
    if (!thought) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing thought content' })
      };
    }

    // Call GPT
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a supportive AI assistant that helps users process their thoughts and emotions. 
          Based on their thought and emotional state, provide:
          1. A brief empathetic summary
          2. A positive reframe of their situation
          3. 2-3 specific action items they can take
          4. 2-3 key priorities to focus on

          Format your response as JSON with these exact fields:
          {
            "summary": "brief empathetic reflection",
            "reframe": "positive perspective",
            "nextSteps": ["action1", "action2", "action3"],
            "priorities": [{"title": "priority1"}, {"title": "priority2"}],
            "tasks": [
              {
                "task": "specific task",
                "type": "emotional|mental|practical|clarity",
                "optional": boolean
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Thought: "${thought}"
          Emotional state: ${moodLabel} (score: ${emotion})`
        }
      ],
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0].message.content);

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
      body: JSON.stringify({
        error: 'Failed to process thought',
        details: error.message
      })
    };
  }
}; 