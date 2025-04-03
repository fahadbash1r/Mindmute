import { useState } from 'react'
import './App.css'

function App() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) {
      return;
    }

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: input.trim() }])
    setIsLoading(true)
    setInput("")
    
    try {
      console.log("Sending request to function...")
      const res = await fetch("/.netlify/functions/gpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ input: input.trim() }),
      })

      console.log("Response status:", res.status)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`)
      }
      
      if (!data.success) {
        throw new Error(data.error || "Something went wrong")
      }
      
      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.clarity }])
    } catch (err) {
      console.error("Error details:", err)
      setMessages(prev => [...prev, { role: 'error', content: `Error: ${err.message}` }])
    } finally {
      setIsLoading(false)
    }
  }

  const renderMessage = (message) => {
    if (message.role === 'error') {
      return <div className="error-message">{message.content}</div>
    }

    if (message.role === 'user') {
      return <div className="user-message">{message.content}</div>
    }

    // Split the assistant's message into sections based on markdown headers
    const sections = message.content.split(/(?=## )/g)
    return (
      <div className="assistant-message">
        {sections.map((section, index) => {
          const title = section.match(/## (.*?)\n/)?.[1]
          const content = section.replace(/## .*?\n/, '').trim()
          return (
            <div key={index} className="message-section">
              <h3>{title}</h3>
              <div className="section-content">{content}</div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>🧠 MindMute</h1>
        <p>Turn overthinking into clear next steps.</p>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              {renderMessage(message)}
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="loading">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your thought spiral..."
            rows={4}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? "Processing..." : "Clear My Mind"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default App

