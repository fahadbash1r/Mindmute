import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import './Tasks.css';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [thoughts, setThoughts] = useState([]);
  const [selectedThought, setSelectedThought] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalTasks, setTotalTasks] = useState(3);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.id);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTasks();
        fetchThoughts();
      }
    });

    // Set up auth subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.id);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTasks();
        fetchThoughts();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const completed = tasks.filter(task => task.completed).length;
    setCompletedCount(completed);
  }, [tasks]);

  // Memoize fetch functions to prevent unnecessary re-renders
  const fetchTasks = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('No active session when fetching tasks');
        return;
      }

      console.log('Fetching tasks for user:', session.user.id);
      const { data, error } = await supabase
        .from('tasks')
        .select('*, thoughts(*)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      
      console.log('Fetched tasks:', data);
      setTasks(data || []);
      setTotalTasks(data ? data.length : 0);
    } catch (error) {
      console.error('Error in fetchTasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchThoughts = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('No active session when fetching thoughts');
        return;
      }

      console.log('Fetching thoughts for user:', session.user.id);
      const { data, error } = await supabase
        .from('thoughts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching thoughts:', error);
        throw error;
      }

      console.log('Fetched thoughts:', data);
      setThoughts(data || []);
      
      // Generate tasks for the most recent thought if needed
      if (data && data.length > 0) {
        const mostRecentThought = data[0];
        console.log('Checking tasks for thought:', mostRecentThought.id);
        
        const { data: existingTasks, error: tasksError } = await supabase
          .from('tasks')
          .select('id')
          .eq('thought_id', mostRecentThought.id)
          .eq('user_id', session.user.id);
          
        if (tasksError) {
          console.error('Error checking existing tasks:', tasksError);
          return;
        }
          
        console.log('Existing tasks for thought:', existingTasks);
        if (!existingTasks || existingTasks.length === 0) {
          console.log('No existing tasks found, generating new tasks...');
          await generateTasksFromThought(mostRecentThought);
        }
      }
    } catch (error) {
      console.error('Error in fetchThoughts:', error);
    }
  }, []);

  const generateTasksFromThought = async (thought) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session); // Debug session

      if (!session?.user) {
        console.error('No active session found');
        return;
      }

      if (!thought || !thought.id) {
        console.error('Invalid thought data:', thought);
        return;
      }

      console.log('Generating tasks for thought:', {
        id: thought.id,
        content: thought.content,
        emotion: thought.emotion,
        mood_label: thought.mood_label
      });

      const functionBody = {
        thought: thought.content,
        emotion: thought.emotion || 50,
        moodLabel: thought.mood_label || 'neutral',
        intention: thought.intention || ''
      };

      console.log('Calling GPT function with:', functionBody);

      // Call the GPT function to process thought and generate tasks
      const response = await fetch('/.netlify/functions/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(functionBody)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('GPT function error:', error);
        return;
      }

      const gptResponse = await response.json();
      console.log('Raw GPT response:', gptResponse);

      // Extract tasks from the GPT response
      const tasksToInsert = gptResponse.tasks.map(task => ({
        user_id: session.user.id,
        thought_id: thought.id,
        task: task.task,
        type: task.type,
        optional: task.optional,
        completed: false,
        created_at: new Date().toISOString()
      }));

      console.log('Inserting tasks:', tasksToInsert);

      const { error: insertError } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

      if (insertError) {
        console.error('Error inserting tasks:', insertError);
        return;
      }

      // Refresh tasks list
      await fetchTasks();
    } catch (error) {
      console.error('Error in generateTasksFromThought:', error);
    }
  };

  async function addTask(e) {
    e.preventDefault();
    if (!newTask.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ 
          task: newTask, 
          completed: false,
          user_id: user.id,
          type: 'custom'
        }])
        .select()
        .single();

      if (error) throw error;
      setTasks([...tasks, data]);
      setNewTask('');
      setTotalTasks(prev => prev + 1);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  async function toggleTask(id, completed, thought_id) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !completed })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      const updatedTasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !completed } : task
      );
      setTasks(updatedTasks);

      // Show thought context if task is being completed
      if (!completed && thought_id) {
        const thought = thoughts.find(t => t.id === thought_id);
        setSelectedThought(thought);
        setTimeout(() => setSelectedThought(null), 3000); // Hide after 3 seconds
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async function deleteTask(id) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  async function refreshTasks() {
    setTasks([]);
    setNewTask('');
    await fetchThoughts(); // This will trigger new task generation
  }

  if (!user) {
    return <div className="loading">Please sign in to manage tasks.</div>;
  }

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h1>🧠 My Daily Clarity Plan</h1>
        <p>Here's what your mind asked for today.</p>
      </div>

      <div className="focus-section">
        <span className="focus-label">✨ Today's Focus: Gentle Self-Motivation</span>
      </div>

      <div className="progress-section">
        <div className="progress-text">
          You've cleared <span className="progress-count">{completedCount} of {totalTasks}</span> clarity steps
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(completedCount / totalTasks) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="add-task-section">
        <button className="add-task-button" onClick={() => setNewTask('')}>
          ➕ Add your own task
        </button>
        {newTask !== '' && (
          <form onSubmit={addTask} className="new-task-form">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Write a task that feels doable"
              className="task-input"
              autoFocus
            />
          </form>
        )}
      </div>

      <div className="tasks-list">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`task-item ${task.completed ? 'completed' : ''} ${task.optional ? 'optional' : ''} ${task.type}`}
            onClick={() => toggleTask(task.id, task.completed, task.thought_id)}
          >
            <div className="checkbox">
              {task.completed ? '✓' : ''}
            </div>
            <div className="task-content">
              <span className="task-text">{task.task}</span>
              {task.optional && <span className="optional-tag">Optional</span>}
              {task.type === 'clarity' && <span className="clarity-tag">Clarity Boost</span>}
            </div>
          </div>
        ))}
      </div>

      {selectedThought && (
        <div className="thought-context">
          💭 "This task was created from your reflection: {selectedThought.content}"
        </div>
      )}

      <div className="tasks-footer">
        <div className="motivation-message">
          👣 "Small steps are still steps."
        </div>
        <button className="refresh-button" onClick={refreshTasks}>
          Refresh Tasks
        </button>
      </div>

      <div className="smart-suggestion">
        <span className="suggestion-label">✏️ Smart suggestion</span>
        <p>These tips evolve as your clarity grows.</p>
        <div className="suggestion-box">
          <div className="checkbox"></div>
          <span>MindMute suggests taking a moment to reflect on your progress...</span>
        </div>
      </div>
    </div>
  );
}