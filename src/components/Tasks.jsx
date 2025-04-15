import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import './Tasks.css';
import { Spinner } from './Spinner';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

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

  if (!user) {
    return <div className="loading">Please sign in to manage tasks.</div>;
  }

  if (loading) return <Spinner />;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (tasks.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <h2 className="text-2xl font-semibold mb-2">🧠 My Daily Clarity Plan</h2>
        <p className="text-gray-600 mb-8">Share your thoughts to get your daily clarity steps.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">🧠 My Daily Clarity Plan</h2>
        <p className="text-gray-600">Here's what your mind asked for today.</p>
      </div>

      <div className="focus-section mb-6">
        <span className="inline-block px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-full text-purple-700 dark:text-purple-300">
          ✨ Today's Focus: Gentle Self-Improvement
        </span>
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div 
            key={task.id}
            className={`p-4 rounded-lg transition-all duration-200 ${
              task.completed ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex items-start gap-4">
              <div 
                className={`flex-shrink-0 w-6 h-6 border-2 rounded cursor-pointer transition-colors ${
                  task.completed 
                    ? 'border-purple-500 bg-purple-500' 
                    : 'border-gray-300 hover:border-purple-500'
                }`}
                onClick={() => toggleTask(task.id, task.completed)}
              >
                {task.completed && (
                  <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-grow">
                <p className={`text-lg ${task.completed ? 'text-gray-500 line-through' : ''}`}>
                  {task.task}
                </p>
                <span className={`inline-block px-2 py-1 text-sm rounded-full mt-2 ${
                  task.type === 'reflect' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                  task.type === 'understand' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                  'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                }`}>
                  {task.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
        <p>👣 "Small steps lead to big changes."</p>
      </div>
    </div>
  );
}