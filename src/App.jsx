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
    <div className="emotion-slider">
      <span role="img" aria-label="sad">😢</span>
      <input type="range" min="1" max="100" defaultValue="50" />
      <span role="img" aria-label="happy">😊</span>
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

function ResponseBox({ summary, reframe, todoList }) {
  return (
    <div className="response-box">
      <div className="response-section summary">
        <h3>Summary</h3>
        <p>{summary || "Share your thoughts to see a summary"}</p>
      </div>
      <div className="response-section reframe">
        <h3>Reframe</h3>
        <p>{reframe || "Your reframed perspective will appear here"}</p>
      </div>
      <div className="response-section todo">
        <h3>To Do List</h3>
        {todoList && todoList.length > 0 ? (
          <ul>
            {todoList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>Action items will appear here after sharing your thoughts</p>
        )}
      </div>
    </div>
  )
}

function App() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [pieData, setPieData] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    
    setIsLoading(true)
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
      setInput("")
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setInput("")
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
        <div className="left-section">
          <PieChart data={pieData} />
        </div>

        <div className="center-section">
          <EmotionSlider />
          <div className="question-box">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your thought..."
              className="question-input"
              rows={4}
            />
          </div>
          <ResponseBox 
            summary=""
            reframe=""
            todoList={[]}
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

        <div className="right-section">
          <ThoughtCabinet oldThoughts={messages} />
        </div>
      </main>
    </div>
  )
}

export default App


