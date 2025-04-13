const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { thought, emotion, moodLabel } = JSON.parse(event.body);

    if (!thought) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Thought is required' })
      };
    }

    // Helper function to get emotion-based response tone
    const getEmotionalTone = (emotion) => {
      if (emotion <= 25) {
        return {
          tone: 'supportive',
          prefix: "I hear you're having a challenging time. ",
          emphasis: "gentle support and understanding",
          actionStyle: "small, manageable steps"
        };
      } else if (emotion <= 50) {
        return {
          tone: 'balanced',
          prefix: "I notice you're finding your balance. ",
          emphasis: "steady progress and grounding",
          actionStyle: "balanced, mindful steps"
        };
      } else if (emotion <= 75) {
        return {
          tone: 'encouraging',
          prefix: "I sense your positive momentum. ",
          emphasis: "building on your progress",
          actionStyle: "confident, forward-moving steps"
        };
      } else {
        return {
          tone: 'celebratory',
          prefix: "I can feel your optimistic energy. ",
          emphasis: "channeling your positive energy",
          actionStyle: "expansive, inspiring actions"
        };
      }
    };

    const emotionalTone = getEmotionalTone(emotion);
    let summary, reframe, nextSteps, priorities;

    if (thought.toLowerCase().includes('overwhelm')) {
      summary = `${emotionalTone.prefix}Things feel overwhelming right now, and that's completely valid.`;
      
      if (emotion <= 25) {
        reframe = "When thoughts start to pile up, it's okay to take things slowly. Let's create a gentle space for you to breathe and find your footing.";
        nextSteps = [
          "Take a moment to breathe - even 10 seconds can help",
          "Name one small thing that feels manageable right now",
          "Remember it's okay to take things one tiny step at a time"
        ];
      } else if (emotion <= 50) {
        reframe = "When thoughts start to accumulate, it's a sign to pause and find your center. You're already taking steps by acknowledging this.";
        nextSteps = [
          "Take a balanced pause - a few deep breaths can help",
          "Identify one thought to focus on first",
          "Choose one action that feels right for now"
        ];
      } else if (emotion <= 75) {
        reframe = "Even in overwhelming moments, you're maintaining perspective. Let's channel this energy into clear, focused steps.";
        nextSteps = [
          "Use your momentum to break things down",
          "Pick one area where you can make progress",
          "Build on your current positive energy"
        ];
      } else {
        reframe = "Your optimistic spirit is a powerful tool. Let's use this energy to transform overwhelming thoughts into exciting possibilities.";
        nextSteps = [
          "Channel your positive energy into organizing thoughts",
          "Choose an inspiring first step to tackle",
          "Use your enthusiasm to create positive change"
        ];
      }
      
      priorities = [
        { title: emotionalTone.emphasis, percentage: 40 },
        { title: "Focused Clarity", percentage: 35 },
        { title: emotionalTone.actionStyle, percentage: 25 }
      ];
    } else if (thought.toLowerCase().includes('stuck') || thought.toLowerCase().includes('cant')) {
      summary = `${emotionalTone.prefix}You're working through a stuck point, and that takes courage.`;
      
      if (emotion <= 25) {
        reframe = "Being stuck isn't a permanent state - it's okay to take time to gather your strength. Every small movement counts.";
        nextSteps = [
          "Be gentle with yourself right now",
          "Notice one tiny possibility that feels safe",
          "Remember that rest is also progress"
        ];
      } else if (emotion <= 50) {
        reframe = "This stuck point is temporary. Your awareness and balanced approach will help you find your way forward.";
        nextSteps = [
          "Take a grounded look at where you are",
          "Identify one clear path to explore",
          "Trust your steady progress"
        ];
      } else if (emotion <= 75) {
        reframe = "Your positive energy can help shift this stuck point. You're already building momentum just by addressing it.";
        nextSteps = [
          "Use your energy to explore new angles",
          "Choose one promising direction",
          "Build on what's already working"
        ];
      } else {
        reframe = "Your optimistic spirit is perfect for transforming stuck points into launching pads. Let's channel this energy!";
        nextSteps = [
          "Transform this challenge into an opportunity",
          "Pick an exciting new approach to try",
          "Use your enthusiasm to break through"
        ];
      }
      
      priorities = [
        { title: emotionalTone.emphasis, percentage: 40 },
        { title: "Moving Forward", percentage: 35 },
        { title: emotionalTone.actionStyle, percentage: 25 }
      ];
    } else {
      summary = `${emotionalTone.prefix}You're taking time to reflect and find clarity.`;
      
      if (emotion <= 25) {
        reframe = "It's okay to take things slowly and be gentle with yourself as you explore these thoughts. Every bit of reflection matters.";
        nextSteps = [
          "Take a gentle moment to acknowledge where you are",
          "Notice one small thing that feels possible",
          "Remember that self-compassion is progress"
        ];
      } else if (emotion <= 50) {
        reframe = "Your balanced approach to reflection will help you find clarity. Trust your process of understanding.";
        nextSteps = [
          "Center yourself in this moment",
          "Explore what feels most relevant now",
          "Take mindful steps forward"
        ];
      } else if (emotion <= 75) {
        reframe = "Your positive energy enhances your reflection. Let's use this momentum to gain deeper insights.";
        nextSteps = [
          "Channel your energy into focused reflection",
          "Choose an inspiring direction to explore",
          "Build on your positive insights"
        ];
      } else {
        reframe = "Your optimistic spirit brings light to this reflection. Let's use this energy to uncover exciting possibilities!";
        nextSteps = [
          "Use your enthusiasm to explore deeply",
          "Transform insights into inspiring actions",
          "Create positive momentum from here"
        ];
      }
      
      priorities = [
        { title: emotionalTone.emphasis, percentage: 40 },
        { title: "Clear Reflection", percentage: 35 },
        { title: emotionalTone.actionStyle, percentage: 25 }
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