import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './mindspace.css';

interface Task {
  id: string;
  task: string;
  type: string;
  optional: boolean;
  completed: boolean;
  created_at: string;
}

interface Thought {
  id: string;
  content: string;
  mood_label: string;
  emotion: number;
  created_at: string;
  tasks: Task[];
}

interface Filter {
  dateFrom: string;
  dateTo: string;
  mood: string;
  search: string;
}

export default function MindSpace() {
  const [entries, setEntries] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>({
    dateFrom: '',
    dateTo: '',
    mood: '',
    search: ''
  });

  useEffect(() => {
    fetchThoughts();
  }, []);

  const fetchThoughts = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('Please sign in to view your mind space.');
      }

      const { data, error } = await supabase
        .from('thoughts')
        .select(`
          id,
          content,
          mood_label,
          emotion,
          created_at,
          tasks (
            id,
            task,
            type,
            optional,
            completed,
            created_at
          )
        `)
        .eq('user_id', user.data.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error('Error fetching thoughts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load archive.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filter, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const filteredEntries = entries.filter(e => {
    const dt = new Date(e.created_at);
    if (filter.dateFrom && dt < new Date(filter.dateFrom)) return false;
    if (filter.dateTo && dt > new Date(filter.dateTo)) return false;
    if (filter.mood && e.mood_label !== filter.mood) return false;
    if (filter.search && !e.content.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const uniqueMoods = Array.from(new Set(entries.map(e => e.mood_label))).filter(Boolean);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Mind Space</h1>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-8">
        <input
          type="date"
          value={filter.dateFrom}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
        <input
          type="date"
          value={filter.dateTo}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
        <select
          value={filter.mood}
          onChange={(e) => handleFilterChange('mood', e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Moods</option>
          {uniqueMoods.map(mood => (
            <option key={mood} value={mood}>{mood}</option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search thoughts..."
          value={filter.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="border rounded-lg px-3 py-2 flex-grow"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="text-red-600 mb-4 p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : (
        /* Thought Cards */
        <div className="space-y-8">
          {filteredEntries.map(thought => (
            <div key={thought.id} className="border p-4 rounded-lg shadow-sm">
              <div className="mb-2 text-gray-700 text-sm">
                <strong>{new Date(thought.created_at).toLocaleString()}</strong>
                {thought.mood_label && (
                  <span> — {thought.mood_label}</span>
                )}
              </div>
              <p className="mb-4 text-gray-900">{thought.content}</p>
              {thought.tasks && thought.tasks.length > 0 && (
                <ul className="space-y-2">
                  {thought.tasks.map(task => (
                    <li key={task.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        disabled
                        className="w-5 h-5"
                      />
                      <span className={task.completed ? 'line-through text-gray-500' : 'text-gray-800'}>
                        {task.task}
                      </span>
                      {task.type && (
                        <span className={`task-tag ${task.type}`}>
                          {task.type}
                        </span>
                      )}
                      {task.optional && (
                        <span className="task-tag optional">
                          Optional
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 