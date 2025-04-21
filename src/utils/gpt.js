import { supabase } from '../supabaseClient';

export async function processThought(thought, emotion, moodLabel, intention) {
  try {
    // Get user profile for personalization
    const { data: { user } } = await supabase.auth.getUser();
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('process-thought', {
      body: {
        thought,
        emotion,
        moodLabel,
        intention,
        userProfile
      }
    });

    if (error) throw error;

    return {
      summary: data.summary,
      reframe: data.reframe,
      nextSteps: data.nextSteps,
      priorities: data.priorities
    };
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
    const { data, error } = await supabase
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

    if (error) {
      console.error('Error saving thought:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in saveThought:', error);
    throw error;
  }
} 