import { useState } from 'react'
import './App.css'

function PieChart({ data }) {
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
      {oldThoughts.map((thought, index) => (
        <div key={index} className="old-thought">
          <h3>{thought.question}</h3>
          <p>{thought.summary}</p>
        </div>
      ))}
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
        <p>{summary}</p>
      </div>
      <div className="response-section reframe">
        <h3>Reframe</h3>
        <p>{reframe}</p>
      </div>
      <div className="response-section todo">
        <h3>To Do List</h3>
        <ul>
          {todoList.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function App() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const pieData = [
    { percentage: 62.5, color: '#8B5CF6', label: 'Item 1', start: 0 },
    { percentage: 25, color: '#7C3AED', label: 'Item 2', start: 62.5 },
    { percentage: 12.5, color: '#6D28D9', label: 'Item 3', start: 87.5 }
  ]

  const oldThoughts = [
    {
      question: "Previous thought...",
      summary: "Summary of the whole box from the last question asked"
    },
    {
      question: "Another thought...",
      summary: "Summary of another previous interaction"
    }
  ]

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
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your thought..."
              className="question-input"
            />
          </div>
          <ResponseBox 
            summary="Your summary will appear here"
            reframe="Reframing will appear here"
            todoList={["Your to-do items will appear here"]}
          />
          <div className="action-buttons">
            <button 
              className="share-btn"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              share thoughts
            </button>
            <button className="clear-btn">Clear mind...</button>
          </div>
        </div>

        <div className="right-section">
          <ThoughtCabinet oldThoughts={oldThoughts} />
        </div>
      </main>
    </div>
  )
}

export default App


