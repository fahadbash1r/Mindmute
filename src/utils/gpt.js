import { supabase } from '../supabaseClient';

export async function processThought(thought, emotion, moodLabel, intention) {
  try {
    const { data: gptData, error: functionError } = await supabase.functions.invoke('process-thought', {
      body: {
        thought,
        emotion: emotion || 50,
        moodLabel: moodLabel || 'neutral',
        intention: intention || '',
      },
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (functionError) {
      console.error('Edge Function Error:', functionError);
      throw new Error(`Failed to process thought: ${functionError.message}`);
    }

    return gptData;
  } catch (error) {
    console.error('Error in processThought:', error);
    throw error;
  }
}

export async function generateTasks(thought, emotion, moodLabel) {
  try {
    const { data: tasksData, error: functionError } = await supabase.functions.invoke('generate-tasks', {
      body: {
        thought,
        emotion: emotion || 50,
        mood_label: moodLabel || 'neutral',
      }
    });

    if (functionError) {
      console.error('Edge Function Error:', functionError);
      throw new Error(`Failed to generate tasks: ${functionError.message}`);
    }

    return tasksData;
  } catch (error) {
    console.error('Error in generateTasks:', error);
    throw error;
  }
}

export async function saveThought(userId, thought, emotion, moodLabel, intention, gptResponse) {
  try {
    const { data: thoughtData, error: thoughtError } = await supabase
      .from('thoughts')
      .insert({
        user_id: userId,
        content: thought,
        emotion: emotion || 50,
        mood_label: moodLabel || 'neutral',
        intention: intention || '',
        created_at: new Date().toISOString(),
        summary: gptResponse.summary,
        reframe: gptResponse.reframe,
        todo_list: gptResponse.nextSteps,
        priorities: gptResponse.priorities
      })
      .select()
      .single();

    if (thoughtError) {
      console.error('Error saving thought:', thoughtError);
      throw thoughtError;
    }

    return thoughtData;
  } catch (error) {
    console.error('Error in saveThought:', error);
    throw error;
  }
} 