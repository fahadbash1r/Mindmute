import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { thought, emotion, mood_label } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a supportive AI assistant that generates personalized tasks to help users process their thoughts and emotions. 
          Create 3-4 actionable tasks based on the user's thought and emotional state.
          Each task should be categorized as either 'emotional', 'mental', 'practical', or 'clarity'.
          Return the tasks in JSON format with fields: description, type, and optional (boolean).
          Tasks should be specific, actionable, and directly related to the user's thought content.`
        },
        {
          role: "user",
          content: `Thought: "${thought}"
          Emotional state: ${mood_label} (score: ${emotion})`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const tasks = JSON.parse(completion.choices[0].message.content);
    return res.status(200).json(tasks.tasks);
  } catch (error) {
    console.error('Error generating tasks:', error);
    return res.status(500).json({ error: 'Failed to generate tasks' });
  }
} 