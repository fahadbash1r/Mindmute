const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { thought } = JSON.parse(event.body);

    if (!thought) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Thought is required' })
      };
    }

    // Process the thought and generate responses
    const summary = `You're feeling ${thought.toLowerCase().includes('overwhelm') ? 'overwhelmed' : 'uncertain'} and seeking clarity.`;
    
    const reframe = "Remember that every challenge is an opportunity for growth. Take a deep breath and break things down into smaller, manageable steps.";
    
    const nextSteps = [
      "Take 5 deep breaths to center yourself",
      "Write down your main concern in one sentence",
      "Identify one small action you can take right now"
    ];

    const priorities = [
      { title: "Self-Care", percentage: 40 },
      { title: "Clear Thinking", percentage: 35 },
      { title: "Action Steps", percentage: 25 }
    ];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary,
        reframe,
        nextSteps,
        priorities
      })
    };

  } catch (error) {
    console.error('Error processing thought:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 