import { useState, useEffect } from 'react';
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
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchTasks();
        fetchThoughts();
      }
    });
  }, []);

  useEffect(() => {
    const completed = tasks.filter(task => task.completed).length;
    setCompletedCount(completed);
  }, [tasks]);

  async function fetchThoughts() {
    try {
      const { data, error } = await supabase
        .from('thoughts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setThoughts(data || []);
      
      // Generate tasks based on the most recent thought if it doesn't already have tasks
      if (data && data.length > 0) {
        const mostRecentThought = data[0];
        const { data: existingTasks } = await supabase
          .from('tasks')
          .select('id')
          .eq('thought_id', mostRecentThought.id);
          
        if (!existingTasks || existingTasks.length === 0) {
          await generateTasksFromThought(mostRecentThought);
        }
      }
    } catch (error) {
      console.error('Error fetching thoughts:', error);
    }
  }

  async function generateTasksFromThought(thought) {
    const moodLabel = thought.mood_label || 'neutral';
    const emotionScore = thought.emotion || 50;
    const thoughtText = thought.content;
    
    let suggestedTasks = [];
    
    // Generate tasks based on emotion score and thought content
    if (emotionScore < 30) {
      // For low emotional states - focus on self-care and gentle activities
      suggestedTasks = [
        {
          task: "Take 5 minutes to breathe deeply and ground yourself",
          type: "emotional",
          thought_id: thought.id,
          optional: false
        },
        {
          task: "Write down one small win from today, no matter how tiny",
          type: "mental",
          thought_id: thought.id,
          optional: false
        },
        {
          task: "Do one gentle act of self-care (make tea, stretch, short walk)",
          type: "practical",
          thought_id: thought.id,
          optional: false
        }
      ];
    } else if (emotionScore < 70) {
      // For moderate emotional states - focus on reflection and growth
      suggestedTasks = [
        {
          task: "Reflect on what brought you balance today",
          type: "mental",
          thought_id: thought.id,
          optional: false
        },
        {
          task: "Set one small, achievable goal for tomorrow",
          type: "practical",
          thought_id: thought.id,
          optional: false
        }
      ];
    } else {
      // For high emotional states - focus on maintaining positivity and channeling energy
      suggestedTasks = [
        {
          task: "Channel this energy into one meaningful activity",
          type: "practical",
          thought_id: thought.id,
          optional: false
        },
        {
          task: "Share your positive state with someone you care about",
          type: "emotional",
          thought_id: thought.id,
          optional: false
        }
      ];
    }

    // Add an optional clarity-boosting task
    suggestedTasks.push({
      task: "Take a moment to journal about what's on your mind",
      type: "clarity",
      thought_id: thought.id,
      optional: true
    });

    // Save generated tasks to Supabase
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(suggestedTasks.map(task => ({
          task: task.task,
          type: task.type,
          thought_id: task.thought_id,
          optional: task.optional,
          user_id: user.id,
          completed: false
        })))
        .select();

      if (error) throw error;
      
      // Instead of setting tasks directly, fetch all tasks again
      await fetchTasks();
    } catch (error) {
      console.error('Error saving generated tasks:', error);
    }
  }

  async function fetchTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, thoughts(*)')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
      setTotalTasks(data.length);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }

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