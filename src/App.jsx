import { useState, useRef, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import darkLogo from './assets/mindmute-dark.png'
import lightLogo from './assets/mindmute-light.png'
import { supabase } from './supabaseClient'
import Login from './components/Login'
import SignUp from './components/SignUp'
import SideMenu from './components/SideMenu'
import Upgrade from './components/Upgrade'
import Tasks from './components/Tasks'
import RequireOnboarding from './components/RequireOnboarding'
import Onboarding from './pages/Onboarding'
import { processThought, saveThought } from './utils/gpt'

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

function EmotionSlider({ onEmotionChange }) {
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

    // Call the callback with the new value
    onEmotionChange?.(value, moodLabel)
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

function PersonalGreeting({ user }) {
  const [isReturningUser, setIsReturningUser] = useState(false)
  
  useEffect(() => {
    // Check if user has visited before using localStorage
    const hasVisited = localStorage.getItem('hasVisited')
    if (hasVisited) {
      setIsReturningUser(true)
    } else {
      localStorage.setItem('hasVisited', 'true')
    }
  }, [])

  // Get user's name from different possible locations in the user object
  const getUserName = () => {
    if (!user) return 'there'
    
    console.log('Full user object:', user)
    console.log('User metadata:', user.user_metadata)
    console.log('User identities:', user.identities)
    
    // Try to get name from user metadata
    const metadataName = user.user_metadata?.full_name || user.user_metadata?.name

    // Try to get name from identity provider data
    const providerName = user.identities?.[0]?.identity_data?.full_name ||
                        user.identities?.[0]?.identity_data?.name

    const finalName = metadataName || providerName || 'there'
    console.log('Final name chosen:', finalName)
    return finalName
  }

  const userName = getUserName()
  
  return (
    <div className="personal-greeting">
      <h2>
        <span role="img" aria-label="waving hand">👋</span>
        {isReturningUser ? `Welcome back, ${userName}` : `Welcome, ${userName}`}
      </h2>
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
      <SideMenu onSignOut={onSignOut} />
      
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

function IntentionSelector({ onIntentionChange }) {
  const [intention, setIntention] = useState('clarity')
  
  const handleChange = (e) => {
    const value = e.target.value
    setIntention(value)
    onIntentionChange?.(value)
  }
  
  return (
    <div className="intention-section">
      <div className="intention-label">What do you want to walk away with?</div>
      <div className="intention-options">
        <label className={`intention-option ${intention === 'clarity' ? 'active' : ''}`}>
          <input
            type="radio"
            name="intention"
            value="clarity"
            checked={intention === 'clarity'}
            onChange={handleChange}
          />
          <span className="intention-icon">💭</span>
          <span className="intention-text">Clarity</span>
        </label>
        
        <label className={`intention-option ${intention === 'motivation' ? 'active' : ''}`}>
          <input
            type="radio"
            name="intention"
            value="motivation"
            checked={intention === 'motivation'}
            onChange={handleChange}
          />
          <span className="intention-icon">🚀</span>
          <span className="intention-text">Motivation</span>
        </label>
        
        <label className={`intention-option ${intention === 'calm' ? 'active' : ''}`}>
          <input
            type="radio"
            name="intention"
            value="calm"
            checked={intention === 'calm'}
            onChange={handleChange}
          />
          <span className="intention-icon">🌊</span>
          <span className="intention-text">Calm</span>
        </label>
        
        <label className={`intention-option ${intention === 'plan' ? 'active' : ''}`}>
          <input
            type="radio"
            name="intention"
            value="plan"
            checked={intention === 'plan'}
            onChange={handleChange}
          />
          <span className="intention-icon">📋</span>
          <span className="intention-text">Plan</span>
        </label>
      </div>
    </div>
  )
}

function ThoughtInput({ onSubmit, emotion, moodLabel, intention }) {
  const [thought, setThought] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!thought.trim()) return;
    if (emotion === undefined) {
      alert("Please share how you're feeling using the slider above first.");
      return;
    }
    
    setIsLoading(true);
    try {
      const formattedData = {
        thought: thought.trim(),
        emotion: emotion,
        moodLabel: moodLabel,
        intention: intention
      };

      await onSubmit(formattedData);
      setThought('');
    } catch (error) {
      console.error('Error submitting thought:', error);
      alert('Failed to process your thought. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setThought('');
  };

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
  );
}

function SignIn() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSignIn = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      alert('Check your email for the confirmation link!')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <form onSubmit={handleSignIn} className="auth-form">
        <h2>Sign In / Sign Up</h2>
        {error && <div className="auth-error">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="auth-buttons">
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Sign In'}
          </button>
          <button type="button" onClick={handleSignUp} disabled={loading}>
            Sign Up
          </button>
        </div>
      </form>
    </div>
  )
}

// Add error boundary component
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (error) => {
      console.error('Application error:', error);
      setHasError(true);
      setError(error);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Something went wrong</h1>
        <pre style={{ color: 'red' }}>{error?.message || 'Unknown error'}</pre>
      </div>
    );
  }

  return children;
}

function App() {
  const [session, setSession] = useState(null)
  const [theme, setTheme] = useState('light')
  const [user, setUser] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [oldThoughts, setOldThoughts] = useState([])
  const [priorities, setPriorities] = useState([])
  const [showPieChart, setShowPieChart] = useState(false)
  const [summary, setSummary] = useState('')
  const [reframe, setReframe] = useState('')
  const [todoList, setTodoList] = useState([])
  const [currentEmotion, setCurrentEmotion] = useState()
  const [currentMoodLabel, setCurrentMoodLabel] = useState()
  const [currentIntention, setCurrentIntention] = useState('clarity')
  const [hasSharedThought, setHasSharedThought] = useState(false)

  useEffect(() => {
    // Set theme attribute on document for CSS selector
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session)
      setSession(session)
      setUser(session?.user ?? null)
    })

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event)
      console.log('New session:', session)
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Only test connection if user is authenticated
  useEffect(() => {
    if (user) {
      console.log('User authenticated:', user)
      const testConnection = async () => {
        try {
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
        } catch (error) {
          console.error('Error testing Supabase connection:', error)
        }
      }
      testConnection()
    }
  }, [user])

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

  const handleThoughtSubmit = async (formattedData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error('No active session when submitting thought');
        return;
      }

      console.log('Starting thought submission with data:', formattedData);

      // Process the thought using GPT utility
      const gptData = await processThought(
        formattedData.thought,
        formattedData.emotion,
        formattedData.moodLabel,
        formattedData.intention
      );

      // Save thought and response using utility
      const thoughtData = await saveThought(
        session.user.id,
        formattedData.thought,
        formattedData.emotion,
        formattedData.moodLabel,
        formattedData.intention,
        gptData
      );

      // Update UI with response
      setSummary(gptData.summary);
      setReframe(gptData.reframe);
      setTodoList(gptData.nextSteps);
      
      // Calculate percentages for priorities
      const totalPriorities = gptData.priorities.length;
      const percentages = gptData.priorities.map((_, index) => {
        if (index === 0) return 50;
        if (index === 1) return 30;
        return 20;
      });

      setPriorities(gptData.priorities.map((priority, index) => ({
        label: priority.title,
        percentage: percentages[index],
        color: getColorForIndex(index)
      })));

      setHasSharedThought(true);

      // Update old thoughts list
      setOldThoughts(prev => [{
        question: formattedData.thought,
        summary: gptData.reframe
      }, ...prev]);

      return thoughtData;
    } catch (error) {
      console.error('Error in handleThoughtSubmit:', error);
      throw error;
    }
  };

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

  const handleEmotionChange = (emotion, label) => {
    setCurrentEmotion(emotion);
    setCurrentMoodLabel(label);
  };

  const handleIntentionChange = (intention) => {
    setCurrentIntention(intention)
  }

  useEffect(() => {
    // Log environment variables (excluding sensitive data)
    console.log('Supabase URL configured:', !!import.meta.env.VITE_SUPABASE_URL);
    console.log('Supabase Key configured:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    // Test Supabase connection
    async function testConnection() {
      try {
        const { data, error } = await supabase.from('thoughts').select('count');
        if (error) throw error;
        console.log('Supabase connection successful');
        setIsConnected(true);
      } catch (error) {
        console.error('Supabase connection error:', error);
        setIsConnected(true); // Still set to true to show UI
      }
    }
    
    testConnection();
  }, []);

  if (!isConnected) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="app" data-theme={theme}>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            <Route element={<RequireOnboarding />}>
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Protected routes that require onboarding */}
              <Route
                path="/"
                element={
                  <div className="main-container">
                    <Header
                      theme={theme}
                      toggleTheme={toggleTheme}
                      user={session?.user}
                      onSignOut={handleSignOut}
                    />
                    <div className="content">
                      <SideMenu />
                      <div className="main-content">
                        <PersonalGreeting user={session?.user} />
                        <EmotionSlider onEmotionChange={handleEmotionChange} />
                        <IntentionSelector onIntentionChange={handleIntentionChange} />
                        <ThoughtInput
                          onSubmit={handleThoughtSubmit}
                          emotion={currentEmotion}
                          moodLabel={currentMoodLabel}
                          intention={currentIntention}
                        />
                        <ResponseSection
                          summary={summary}
                          reframe={reframe}
                          todoList={todoList}
                          isVisible={summary || reframe || todoList.length > 0}
                        />
                        <PriorityBars data={priorities} />
                        <ThoughtCabinet oldThoughts={oldThoughts} />
                      </div>
                    </div>
                  </div>
                }
              />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/upgrade" element={<Upgrade />} />
            </Route>

            {/* Redirect unmatched routes to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  )
}

export default App


