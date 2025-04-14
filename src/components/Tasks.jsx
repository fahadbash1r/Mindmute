import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Tasks.css';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalTasks, setTotalTasks] = useState(3); // Default number of tasks

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchTasks();
      }
    });
  }, []);

  useEffect(() => {
    const completed = tasks.filter(task => task.completed).length;
    setCompletedCount(completed);
  }, [tasks]);

  async function fetchTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
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
          user_id: user.id 
        }])
        .select()
        .single();

      if (error) throw error;
      setTasks([...tasks, data]);
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  async function toggleTask(id, completed) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !completed })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed: !completed } : task
      ));
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
    fetchTasks();
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
        <span className="focus-label">🌟 Today's Focus: Gentle Self-Motivation</span>
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
            className={`task-item ${task.completed ? 'completed' : ''}`}
            onClick={() => toggleTask(task.id, task.completed)}
          >
            <div className="checkbox">
              {task.completed ? '✓' : ''}
            </div>
            <span className="task-text">{task.task}</span>
          </div>
        ))}
      </div>

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
          <span>MindMute suggests...</span>
        </div>
      </div>
    </div>
  );
} 