import { useState } from 'react'
import './App.css'

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
  const [moodLabel, setMoodLabel] = useState('Moderately Happy')
  
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
      <h3>How are you feeling?</h3>
      <div className="emotion-label">{moodLabel}</div>
      <div className="emotion-slider">
        <span>😔</span>
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
        <span>😊</span>
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
  if (!isVisible) return null;
  
  return (
    <div className="response-section">
      <div className="response-box">
        <h3>Summary</h3>
        <p>{summary || "Processing your thoughts..."}</p>
      </div>
      <div className="response-box">
        <h3>Reframe</h3>
        <p>{reframe || "Creating a new perspective..."}</p>
      </div>
      <div className="response-box">
        <h3>To Do List</h3>
        {todoList && todoList.length > 0 ? (
          <ol>
            {todoList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        ) : (
          <p>Generating action items...</p>
        )}
      </div>
    </div>
  )
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

function App() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [pieData, setPieData] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [currentResponse, setCurrentResponse] = useState({
    summary: "",
    reframe: "",
    todoList: [],
    priorities: []
  })

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    
    setIsLoading(true)
    setShowResults(true)
    try {
      const res = await fetch("/.netlify/functions/gpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: input.trim() }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP error! status: ${res.status}`)
      
      // Parse the response and update the UI
      const response = data.clarity
      setCurrentResponse({
        summary: response.summary || response,
        reframe: response.reframe || "Here's a new perspective on your thoughts...",
        todoList: response.todoList || [],
        priorities: response.priorities || []
      })

      // Update pie chart data if priorities are provided
      if (response.priorities && response.priorities.length > 0) {
        const total = response.priorities.reduce((acc, curr) => acc + curr.weight, 0)
        let startAngle = 0
        
        const chartData = response.priorities.map(priority => {
          const percentage = (priority.weight / total) * 100
          const data = {
            label: priority.item,
            percentage,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            start: startAngle
          }
          startAngle += (percentage / 100) * 360
          return data
        })
        setPieData(chartData)
      }

      setMessages(prev => [...prev, {
        question: input,
        summary: response.summary || response,
        reframe: response.reframe || "Here's a new perspective on your thoughts...",
        todoList: response.todoList || []
      }])
      
      setInput("")
    } catch (err) {
      console.error("Error:", err)
      setShowResults(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setInput("")
    setShowResults(false)
    setPieData([])
    setCurrentResponse({
      summary: "",
      reframe: "",
      todoList: [],
      priorities: []
    })
  }

  return (
    <div className={`app-container ${theme}`}>
      <header>
        <div className="token-info">
          <button className="upgrade-btn">upgrade</button>
          <p>1 Free Token A Day to ask and express thoughts</p>
        </div>
        <div className="logo">
          <h1>🧠 MINDMUTE</h1>
          <p>turn overthinking into clear next steps</p>
        </div>
        <div className="auth-buttons">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
          <button className="sign-up-btn">sign up</button>
        </div>
      </header>

      <main>
        <EmotionSlider />
        
        <div className="thought-input-section">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your thought..."
            className="question-input"
            rows={4}
          />
          <div className="action-buttons">
            <button 
              className="share-btn"
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? "Processing..." : "Share Thoughts"}
            </button>
            <button 
              className="clear-btn"
              onClick={handleClear}
            >
              Clear Mind
            </button>
          </div>
        </div>

        <ResponseSection 
          summary={currentResponse.summary}
          reframe={currentResponse.reframe}
          todoList={currentResponse.todoList}
          isVisible={showResults}
        />

        <PriorityBars 
          data={pieData}
          isVisible={showResults && pieData.length > 0}
        />

        <div className="thought-cabinet">
          <h2>Thought Cabinet</h2>
          {messages && messages.length > 0 ? (
            messages.map((thought, index) => (
              <div key={index} className="old-thought">
                <h3>{thought.question}</h3>
                <p>{thought.reframe}</p>
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
      </main>
    </div>
  )
}

export default App


