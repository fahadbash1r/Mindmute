import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import './Tasks.css';
import { Spinner } from './Spinner';
import Header from './Header';
import SideMenu from './SideMenu';
import { PriorityBars } from '../App';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalTasks, setTotalTasks] = useState(5); // Fixed at 5 tasks
  const [theme, setTheme] = useState('light');
  const [priorities, setPriorities] = useState([]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTasks();
      }
    });

    // Set up auth subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTasks();
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

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First, delete any tasks beyond the most recent 5
      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact' });

      if (count > 5) {
        const { data: oldTasks } = await supabase
          .from('tasks')
          .select('id, created_at')
          .order('created_at', { ascending: false })
          .range(5, count - 1);

        if (oldTasks?.length > 0) {
          await supabase
            .from('tasks')
            .delete()
            .in('id', oldTasks.map(t => t.id));
        }
      }

      // Now fetch the 5 most recent tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (tasksError) throw tasksError;

      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Unable to load your clarity steps. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleTask = async (id, completed) => {
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
      setError(error.message);
    }
  };

  const TaskItem = ({ task, onToggle }) => {
    return (
      <div className={`task-item ${task.type} ${task.completed ? 'completed' : ''}`}>
        <div className="checkbox" onClick={() => onToggle(task.id, task.completed)}>
          {task.completed && '✓'}
        </div>
        <div className="task-content">
          <div className="task-text">
            {task.task}
            {task.optional && <span className="task-tag optional">Optional</span>}
          </div>
          <div className={`task-tag ${task.type}`}>{task.type}</div>
        </div>
      </div>
    );
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const fetchPriorities = async () => {
    try {
      const { data, error } = await supabase
        .from('thoughts')
        .select('priorities')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (data?.priorities) {
        setPriorities(data.priorities.map((priority, index) => ({
          label: priority.title,
          percentage: index === 0 ? 50 : index === 1 ? 30 : 20,
          color: getColorForIndex(index)
        })));
      }
    } catch (error) {
      console.error('Error fetching priorities:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPriorities();
    }
  }, [user]);

  // Helper function to get colors for priorities
  const getColorForIndex = (index) => {
    const colors = [
      '#8b5cf6', // Purple
      '#06b6d4', // Cyan
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#ec4899', // Pink
      '#6366f1', // Indigo
      '#84cc16', // Lime
      '#14b8a6', // Teal
      '#f97316'  // Orange
    ];
    return colors[index % colors.length];
  };

  if (!user) {
    return <div className="loading">Please sign in to manage tasks.</div>;
  }

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="app" data-theme={theme}>
      <div className="main-container">
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          user={user}
          onSignOut={handleSignOut}
        />
        <div className="content">
          <SideMenu onSignOut={handleSignOut} />
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

            <div className="tasks-list">
              {tasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </div>

            <PriorityBars data={priorities} />

            <div className="tasks-footer">
              <div className="motivation-message">
                👣 "Small steps lead to big changes."
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}