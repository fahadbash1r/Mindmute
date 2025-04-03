import { useState } from 'react'
import './App.css'

function PieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="pie-chart-container">
        <h3>What to prioritise first...</h3>
        <div className="pie-chart-empty">
          Share your thoughts to see a breakdown
        </div>
      </div>
    )
  }
  
  return (
    <div className="pie-chart-container">
      <h3>What to prioritise first...</h3>
      <div className="pie-chart">
        {data.map((item, index) => (
          <div 
            key={index}
            className="pie-segment"
            style={{
              '--percentage': item.percentage,
              '--color': item.color,
              '--start': item.start
            }}
          >
            <div className="pie-label">
              {item.label} ({item.percentage}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmotionSlider() {
  return (
    <div className="emotion-section">
      <h3>How are you feeling?</h3>
      <div className="emotion-slider">
        <span>😔</span>
        <div className="slider-track">
          <div className="slider-thumb" style={{ left: '50%' }} />
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
          <ul>
            {todoList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
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
    <div className="pie-chart-section visible">
      <h3>What to prioritise first...</h3>
      {data && data.length > 0 ? (
        <div className="pie-chart">
          {data.map((item, index) => (
            <div key={index} className="pie-segment">
              {item.label} ({item.percentage}%)
            </div>
          ))}
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
      
      setMessages(prev => [...prev, {
        question: input,
        response: data.clarity
      }])
      // TODO: Update pieData based on API response
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
  }

  return (
    <div className="app-container">
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
              Share Thoughts
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
          summary=""
          reframe=""
          todoList={[]}
          isVisible={showResults}
        />

        <PieChartSection 
          data={pieData}
          isVisible={showResults}
        />

        <div className="thought-cabinet">
          <h2>Thought Cabinet</h2>
          {messages && messages.length > 0 ? (
            messages.map((thought, index) => (
              <div key={index} className="old-thought">
                <h3>{thought.question}</h3>
                <p>{thought.response}</p>
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


