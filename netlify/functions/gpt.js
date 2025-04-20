const OpenAI = require('openai');
const { Pool } = require('pg');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event) => {
  // Handle CORS preflight requests
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
    const { thought, emotion, moodLabel, intention, userId } = JSON.parse(event.body);

    if (!thought || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Fetch user preferences from database
    const client = await pool.connect();
    let userProfile;
    try {
      const result = await client.query(
        'SELECT mood, challenge, clarity_area, spin_frequency, desired_outcome, daily_time, tone_preference FROM profiles WHERE id = $1',
        [userId]
      );
      userProfile = result.rows[0];
    } finally {
      client.release();
    }

    // Create personalized system message
    const systemMessage = `You are an empathetic AI assistant that helps users process their thoughts and emotions with warmth and understanding. Your responses should be supportive, non-judgmental, and growth-oriented.

Based on the user's profile:
- They typically feel: ${userProfile?.mood || 'varied emotions'}
- Their main challenge is: ${userProfile?.challenge || 'managing thoughts'}
- They seek clarity in: ${userProfile?.clarity_area || 'various areas'}
- Thoughts spin out: ${userProfile?.spin_frequency || 'sometimes'}
- They want to achieve: ${userProfile?.desired_outcome || 'better mental clarity'}
- They can spend: ${userProfile?.daily_time || '15 minutes'} daily
- They prefer a ${userProfile?.tone_preference || 'balanced'} tone

When analyzing thoughts, follow this specific structure:

1. Summary (2-3 sentences):
   - Reflect back the core message with empathy
   - Acknowledge the emotional undertones
   - Keep it concise but validating

2. Reframe (3-4 sentences):
   - Offer a gentle perspective shift that aligns with their desired outcome
   - Focus on growth and learning
   - Maintain hope while being realistic
   - Validate their experience while suggesting possibilities

3. Next Steps (3-4 concrete actions):
   - Mix of practical and emotional actions
   - Make them specific and achievable within their available time
   - Include at least one self-care focused step
   - Ensure they align with the user's emotional state and challenges

4. Key Priorities (2-3 focus areas):
   - Balance immediate needs with long-term growth
   - Include both emotional and practical priorities
   - Keep them aligned with the user's intention and clarity goals`;

    // Generate response using GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: `Thought: "${thought}"
Emotional state: ${moodLabel} (score: ${emotion})
Intention: ${intention}`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0].message.content);

    // Save thought and response to database
    const client2 = await pool.connect();
    try {
      const result = await client2.query(
        `INSERT INTO thoughts (
          user_id, 
          content, 
          emotion, 
          mood_label, 
          intention, 
          summary,
          reframe,
          todo_list,
          priorities,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *`,
        [
          userId,
          thought,
          emotion || 50,
          moodLabel || 'neutral',
          intention || '',
          response.summary,
          response.reframe,
          response.nextSteps,
          response.priorities
        ]
      );

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          thought: result.rows[0],
          gptResponse: response
        })
      };
    } finally {
      client2.release();
    }
  } catch (error) {
    console.error('Error processing thought:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process thought' })
    };
  }
}; 