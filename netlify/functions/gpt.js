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

    // Process the thought with empathetic responses
    let summary, reframe, nextSteps, priorities;

    if (thought.toLowerCase().includes('overwhelm')) {
      summary = "I hear that things feel overwhelming right now. Your mind is carrying a lot, and that's completely valid.";
      reframe = "When thoughts start to pile up, it's not a sign of failure — it's your mind asking for a moment to breathe and find clarity. Let's create some space together.";
      nextSteps = [
        "Take a gentle pause - even 30 seconds of deep breathing can create a small shift",
        "Name one thought that feels heaviest - sometimes just acknowledging it helps",
        "Choose one tiny action that might bring relief - it doesn't have to be perfect"
      ];
      priorities = [
        { title: "Creating Space", percentage: 40 },
        { title: "Gentle Focus", percentage: 35 },
        { title: "Small Steps", percentage: 25 }
      ];
    } else if (thought.toLowerCase().includes('stuck') || thought.toLowerCase().includes('cant')) {
      summary = "It sounds like you're feeling stuck right now. That's a really human experience, and it's okay to pause here.";
      reframe = "Being stuck isn't always about being lost - sometimes it's about gathering energy for your next clear step. Your awareness right now is actually the first move forward.";
      nextSteps = [
        "Notice where you feel most drawn to begin - trust that instinct",
        "Pick one small thing that feels possible today",
        "Celebrate any movement, no matter how subtle it seems"
      ];
      priorities = [
        { title: "Self-Trust", percentage: 40 },
        { title: "Mindful Action", percentage: 35 },
        { title: "Patient Progress", percentage: 25 }
      ];
    } else {
      summary = "I'm hearing you're seeking some clarity. Your thoughts deserve this space to unfold.";
      reframe = "Sometimes the path forward becomes clearer not by pushing harder, but by giving yourself permission to explore at your own pace. Each reflection is a step toward understanding.";
      nextSteps = [
        "Take a moment to sit with what feels most present for you",
        "Notice what small step feels inviting - not pressured",
        "Remember that any movement, even just reflection, is valuable"
      ];
      priorities = [
        { title: "Present Awareness", percentage: 40 },
        { title: "Gentle Exploration", percentage: 35 },
        { title: "Mindful Movement", percentage: 25 }
      ];
    }

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