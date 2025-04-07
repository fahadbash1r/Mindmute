import { useState, useRef, useEffect } from 'react'
import './App.css'
import darkLogo from './assets/mindmute-dark.png'
import lightLogo from './assets/mindmute-light.png'

function PriorityBars({ data }) {
  // Helper function to get motivational message
  const getMotivation = (task) => {
    // Create a map of task keywords to motivational messages
    const motivationMap = {
      'review': "Taking time to review shows wisdom. Your adaptability is your strength!",
      'adapt': "Change brings opportunity. You're already on the path to improvement!",
      'feedback': "Seeking guidance is a sign of strength. The right answers will come!",
      'advice': "Reaching out shows courage. You're taking positive steps forward!",
      'break': "Rest is essential for clarity. You'll return stronger and more focused!",
      'recharge': "Taking care of yourself is productive. Your energy will be renewed!",
      'reflect': "Looking back helps us move forward. You're gaining valuable insights!",
      'self': "Being kind to yourself is powerful. You're building inner strength!",
      'goals': "Small steps lead to big changes. You're creating a better path!",
      'practice': "Practice builds confidence. You're developing stronger habits!"
    };

    // Find matching keywords in the task
    const taskLower = task.toLowerCase();
    const matchingMessage = Object.entries(motivationMap).find(([key]) => 
      taskLower.includes(key)
    );

    // Return the matching message or a default encouraging message
    return matchingMessage ? matchingMessage[1] : "You've got this! Every step counts toward your goal!";
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
              {getMotivation(item.label)}
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

function Header({ theme, toggleTheme }) {
  return (
    <header>
      <div className="auth-buttons">
        <button className="upgrade-btn">upgrade</button>
        <button className="sign-up-btn">sign up</button>
        <a href="#" className="login-btn">Login</a>
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
      if (data.error) {
        throw new Error(data.error);
      }

      // Extract the clarity object from the response
      const clarity = data.clarity || data;
      
      // Format the response data
      const formattedData = {
        summary: clarity.summary || clarity,
        reframe: clarity.reframe || "Here's a new perspective on your thoughts...",
        todoList: clarity.todoList || [],
        priorities: clarity.priorities ? clarity.priorities.map((priority, index) => ({
          label: priority.item,
          percentage: priority.weight,
          color: getColorForIndex(index)
        })) : []
      };

      onSubmit(formattedData);
      setThought('');
    } catch (error) {
      console.error('Error:', error);
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
  const [theme, setTheme] = useState('dark')
  const [response, setResponse] = useState(null)
  const [oldThoughts, setOldThoughts] = useState([])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleThoughtSubmit = (data) => {
    console.log('Received response:', data); // Add this for debugging
    setResponse(data);
    if (data.summary) {
      setOldThoughts(prev => [{
        question: data.summary,
        summary: data.reframe
      }, ...prev]);
    }
  }

  return (
    <div className={`app-container ${theme}`}>
      <Header theme={theme} toggleTheme={toggleTheme} />
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


