import { useState, useRef, useEffect } from 'react'
import './App.css'
import darkLogo from './assets/mindmute-dark.png'
import lightLogo from './assets/mindmute-light.png'
import { supabase } from './supabaseClient'

function PriorityBars({ data }) {
  // Helper function to get motivational message
  const getMotivation = (task, index) => {
    // Create a map of task keywords to motivational messages array
    const motivationMap = {
      'self': [
        "Being kind to yourself builds resilience. Keep nurturing your spirit!",
        "Your well-being matters most. Take time to recharge.",
        "Small acts of self-care create big positive changes."
      ],
      'support': [
        "Reaching out shows strength. You're not alone in this.",
        "Connection brings clarity. Your support network is there for you.",
        "Every conversation is a step toward understanding."
      ],
      'routine': [
        "Small habits build strong foundations. Keep going!",
        "Each day is a chance to grow stronger.",
        "Consistency creates lasting change. You're on the right path."
      ],
      'plan': [
        "Breaking it down makes it manageable. One step at a time.",
        "Your roadmap is taking shape. Trust the process.",
        "Clear goals lead to clear progress."
      ],
      'reflect': [
        "Your insights are valuable. Trust your inner wisdom.",
        "Taking time to process helps you grow stronger.",
        "Understanding yourself better with each moment of reflection."
      ],
      'action': [
        "Every small step counts. You're making progress!",
        "Movement creates momentum. Keep going forward.",
        "Your actions shape your path. Trust your journey."
      ],
      'rest': [
        "Rest is productive. You're recharging for what's ahead.",
        "Taking breaks builds strength. Listen to your needs.",
        "Pause and breathe. You're exactly where you need to be."
      ],
      'connect': [
        "Reaching out creates bridges. You're building connections.",
        "Sharing lightens the load. Your voice matters.",
        "Together we go further. Keep connecting."
      ],
      'focus': [
        "One thing at a time. You're finding your flow.",
        "Clear mind, clear path. Stay focused on what matters.",
        "Your attention is powerful. Direct it wisely."
      ],
      'change': [
        "Change brings growth. Embrace the journey.",
        "New paths lead to new strengths. Keep exploring.",
        "You're adapting and growing stronger each day."
      ]
    };

    // Find matching keywords in the task
    const taskLower = task.toLowerCase();
    let matchingMessages = null;

    for (const [key, messages] of Object.entries(motivationMap)) {
      if (taskLower.includes(key)) {
        matchingMessages = messages;
        break;
      }
    }

    // If no specific match found, use general encouraging messages
    const generalMessages = [
      "You've got this! Every step matters.",
      "Trust your journey. You're making progress.",
      "Small steps lead to big changes.",
      "Your effort today shapes tomorrow.",
      "Keep going! You're on the right path."
    ];

    // Use matching messages or general messages, and rotate based on index
    const messageArray = matchingMessages || generalMessages;
    return messageArray[index % messageArray.length];
  }

  if (!data || data.length === 0) {
    return (
      <div className="priorities-section">
        <h3>What to prioritise first...</h3>
        <div className="pie-chart-empty">
          Share your thoughts to see priorities
        </div>
      </div>
    );
  }

  return (
    <div className="priorities-section">
      <h3>What to prioritise first...</h3>
      <div className="priority-bars">
        {data.map((item, index) => (
          <div key={index}>
            <div className="priority-label">
              <span>{item.label}</span>
              <span>{Math.round(item.percentage)}%</span>
            </div>
            <div className="priority-bar">
              <div 
                className="priority-bar-fill" 
                style={{
                  width: `${item.percentage}%`,
                  '--bar-color': item.color
                }}
              />
            </div>
            <div className="priority-motivation">
              {getMotivation(item.label, index)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmotionSlider() {
  const [emotion, setEmotion] = useState(50)
  const [moodLabel, setMoodLabel] = useState('Finding balance in the journey')
  
  const handleChange = (e) => {
    const value = parseInt(e.target.value)
    setEmotion(value)
    
    // Update mood label based on value
    if (value <= 25) {
      setMoodLabel('Taking a moment to acknowledge feelings')
    } else if (value <= 50) {
      setMoodLabel('Finding balance in the journey')
    } else if (value <= 75) {
      setMoodLabel('Building positive momentum')
    } else {
      setMoodLabel('Embracing joy and optimism')
    }
  }
  
  return (
    <div className="emotion-section">
      <div className="emotion-label">How are you feeling?</div>
      <div className="mood-label">{moodLabel}</div>
      <div className="emotion-slider">
        <span role="img" aria-label="sad">😔</span>
        <div className="slider-track">
          <input
            type="range"
            min="0"
            max="100"
            value={emotion}
            onChange={handleChange}
            className="slider-input"
          />
          <div 
            className="slider-thumb" 
            style={{ 
              left: `${emotion}%`,
              cursor: 'pointer'
            }} 
          />
        </div>
        <span role="img" aria-label="happy">😊</span>
      </div>
    </div>
  )
}

function ThoughtCabinet({ oldThoughts }) {
  return (
    <div className="thought-cabinet">
      <h2>Thought Cabinet</h2>
      {oldThoughts && oldThoughts.length > 0 ? (
        oldThoughts.map((thought, index) => (
          <div key={index} className="old-thought">
            <h3>{thought.question}</h3>
            <p>{thought.summary}</p>
          </div>
        ))
      ) : (
        <div className="empty-state">
          No previous thoughts yet. Share your first thought to get started!
        </div>
      )}
      <div className="mindful-quote">
        <h3>Mindful Quote of the Day</h3>
        <p>"Your thoughts shape your reality, choose them wisely."</p>
      </div>
    </div>
  )
}

function ResponseSection({ summary, reframe, todoList, isVisible }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const responseRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (responseRef.current) {
        const scrollPosition = responseRef.current.scrollLeft;
        const width = responseRef.current.offsetWidth;
        const newIndex = Math.round(scrollPosition / width);
        setActiveIndex(newIndex);
      }
    };

    const element = responseRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleArrowClick = (direction) => {
    if (responseRef.current) {
      const width = responseRef.current.offsetWidth;
      const newPosition = direction === 'left' 
        ? responseRef.current.scrollLeft - width
        : responseRef.current.scrollLeft + width;
      responseRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  if (!isVisible) return null;
  
  const responses = [
    { title: 'Summary', content: summary || "Processing your thoughts..." },
    { title: 'Reframe', content: reframe || "Creating a new perspective..." },
    { title: 'To Do List', content: todoList && todoList.length > 0 ? (
      <ol>
        {todoList.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    ) : "Generating action items..." }
  ];

  return (
    <>
      <div className="swipe-instruction">Swipe to see more</div>
      <div className="response-section" ref={responseRef}>
        {responses.map((response, index) => (
          <div key={index} className="response-box">
            <h3>{response.title}</h3>
            {typeof response.content === 'string' ? (
              <p>{response.content}</p>
            ) : (
              response.content
            )}
          </div>
        ))}
        {activeIndex > 0 && (
          <div className="swipe-arrow left" onClick={() => handleArrowClick('left')}>⟵</div>
        )}
        {activeIndex < responses.length - 1 && (
          <div className="swipe-arrow right" onClick={() => handleArrowClick('right')}>⟶</div>
        )}
      </div>
      <div className="swipe-indicator">
        {responses.map((_, index) => (
          <div 
            key={index} 
            className={`swipe-dot ${index === activeIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </>
  );
}

function PieChartSection({ data, isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="pie-chart-section">
      <h3>What to prioritise first...</h3>
      {data && data.length > 0 ? (
        <div className="pie-chart">
          {data.map((item, index) => {
            const startAngle = (item.start * Math.PI * 2) / 360;
            const endAngle = ((item.start + item.percentage / 100 * 360) * Math.PI * 2) / 360;
            
            // Calculate SVG path for pie segment
            const x1 = 150 + Math.cos(startAngle) * 150;
            const y1 = 150 + Math.sin(startAngle) * 150;
            const x2 = 150 + Math.cos(endAngle) * 150;
            const y2 = 150 + Math.sin(endAngle) * 150;
            
            const largeArc = item.percentage > 50 ? 1 : 0;
            
            const path = `
              M 150 150
              L ${x1} ${y1}
              A 150 150 0 ${largeArc} 1 ${x2} ${y2}
              Z
            `;
            
            return (
              <svg
                key={index}
                viewBox="0 0 300 300"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                }}
              >
                <path
                  d={path}
                  fill={item.color}
                  stroke="var(--box-border)"
                  strokeWidth="1"
                />
                <g transform={`rotate(${item.start + item.percentage/2})`}>
                  <foreignObject
                    x="50%"
                    y="50%"
                    width="120"
                    height="60"
                    style={{
                      transform: 'translate(-60px, -30px)',
                    }}
                  >
                    <div className="pie-label">
                      {item.label}<br />
                      {Math.round(item.percentage)}%
                    </div>
                  </foreignObject>
                </g>
              </svg>
            );
          })}
        </div>
      ) : (
        <div className="pie-chart-empty">
          Analyzing your priorities...
        </div>
      )}
    </div>
  )
}

function Header({ theme, toggleTheme, user, onSignOut }) {
  return (
    <header>
      <div className="auth-buttons">
        {user ? (
          <>
            <span className="user-email">{user.email}</span>
            <button className="sign-up-btn" onClick={onSignOut}>Sign Out</button>
          </>
        ) : (
          <>
            <button className="upgrade-btn">upgrade</button>
            <button className="sign-up-btn">sign up</button>
            <a href="#" className="login-btn">Login</a>
          </>
        )}
      </div>

      <div className="logo-wrapper">
        <div className="logo">
          {theme === 'light' ? (
            <img 
              src={darkLogo}
              alt="Mindmute"
              width="600"
              height="160"
              loading="eager"
            />
          ) : (
            <img 
              src={lightLogo}
              alt="Mindmute"
              width="600"
              height="160"
              loading="eager"
            />
          )}
          <p>Finding balance in the journey</p>
        </div>
      </div>

      <button 
        className="mode-switcher" 
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? '🌞' : '🌙'}
      </button>
    </header>
  );
}

function ThoughtInput({ onSubmit }) {
  const [thought, setThought] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!thought.trim()) return;
    
    setIsLoading(true)
    try {
      const response = await fetch('/.netlify/functions/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ thought: thought.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const data = await response.json();
      
      // Calculate percentages based on priority order
      const totalPriorities = data.priorities.length;
      const percentages = data.priorities.map((_, index) => {
        // First priority gets 50%, second gets 30%, third gets 20%
        if (index === 0) return 50;
        if (index === 1) return 30;
        if (index === 2) return 20;
        // If there are more priorities, distribute remaining evenly
        return Math.floor(100 / totalPriorities);
      });
      
      // Format the response data
      const formattedData = {
        summary: data.summary || "Unable to generate summary",
        reframe: data.reframe || "Unable to generate reframe",
        todoList: data.nextSteps || [],
        priorities: data.priorities ? data.priorities.map((priority, index) => ({
          label: priority.title,
          percentage: percentages[index],
          color: getColorForIndex(index)
        })) : []
      };

      onSubmit(formattedData);
      setThought('');
    } catch (error) {
      console.error('Error:', error);
      // Don't clear the thought input on error
      alert(error.message || 'Failed to process your thought. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

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
  }

  const handleClear = () => {
    setThought('');
  }

  return (
    <div className="thought-input-section">
      <textarea
        value={thought}
        onChange={(e) => setThought(e.target.value)}
        placeholder="Share your thought..."
        className="thought-input"
        style={{ maxHeight: '200px' }}
      />
      <div className="button-group">
        <button 
          onClick={handleSubmit} 
          className="share-btn"
          disabled={isLoading || !thought.trim()}
        >
          {isLoading ? "Processing..." : "Share Thoughts"}
        </button>
        <button 
          onClick={handleClear}
          className="clear-btn"
        >
          Clear Mind
        </button>
      </div>
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState('light')
  const [response, setResponse] = useState(null)
  const [oldThoughts, setOldThoughts] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Test Supabase connection and table structure
    const testConnection = async () => {
      try {
        // Insert a test record
        const { error: insertError } = await supabase
          .from('thoughts')
          .insert([
            {
              summary: 'Test thought',
              reframe: 'Test reframe',
              todo_list: ['Test todo 1', 'Test todo 2'],
              priorities: [
                { title: 'Test priority 1', percentage: 60 },
                { title: 'Test priority 2', percentage: 40 }
              ]
            }
          ])

        if (insertError) {
          console.error('Error inserting test record:', insertError.message)
        } else {
          // Try to select records to verify
          const { data, error } = await supabase
            .from('thoughts')
            .select('*')
            .limit(1)
          
          if (error) {
            console.error('Supabase connection error:', error.message)
          } else {
            console.log('Supabase connected successfully, table structure:', data)
          }
        }
      } catch (error) {
        console.error('Error testing Supabase connection:', error)
      }
    }
    testConnection()

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error.message)
    }
  }

  const handleThoughtSubmit = async (data) => {
    console.log('Received response:', data)
    setResponse(data)
    
    if (data.summary && user) {
      try {
        // Store thought in Supabase
        const { error } = await supabase
          .from('thoughts')
          .insert([
            {
              user_id: user.id,
              summary: data.summary,
              reframe: data.reframe,
              todo_list: data.todoList,
              priorities: data.priorities
            }
          ])
        
        if (error) throw error

        setOldThoughts(prev => [{
          question: data.summary,
          summary: data.reframe
        }, ...prev])
      } catch (error) {
        console.error('Error saving thought:', error.message)
      }
    }
  }

  return (
    <div className={`app-container ${theme}`}>
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme}
        user={user}
        onSignOut={handleSignOut}
      />
      <main>
        <EmotionSlider />
        <ThoughtInput onSubmit={handleThoughtSubmit} />
        <ResponseSection 
          summary={response?.summary}
          reframe={response?.reframe}
          todoList={response?.todoList}
          isVisible={!!response}
        />
        <PriorityBars data={response?.priorities} />
        <ThoughtCabinet oldThoughts={oldThoughts} />
      </main>
    </div>
  )
}

export default App


