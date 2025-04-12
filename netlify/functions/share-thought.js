const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { thought, userId, mood } = JSON.parse(event.body);

    if (!thought || !userId || !mood) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO thoughts (user_id, content, mood, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [userId, thought, mood]
      );

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(result.rows[0])
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error sharing thought:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 