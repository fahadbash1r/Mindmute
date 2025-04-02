import { useState } from 'react'
import './App.css'

function App() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (!input.trim()) {
      setOutput("Please enter some text first.");
      return;
    }

    setIsLoading(true)
    setOutput("")
    
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
      console.log("Response headers:", Object.fromEntries(res.headers.entries()))
      
      const data = await res.json()
      console.log("Response data:", data)
      
      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`)
      }
      
      if (!data.success) {
        throw new Error(data.error || "Something went wrong")
      }
      
      setOutput(data.clarity || "No response received")
    } catch (err) {
      console.error("Error details:", err)
      setOutput(`Error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ textAlign: "center", padding: "2rem", color: "#fff" }}>
      <h1>🧠 MindMute</h1>
      <p>Turn overthinking into clear next steps.</p>

      <input
        type="text"
        placeholder="Type your thought spiral..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          padding: "0.5rem",
          fontSize: "1rem",
          width: "300px",
          marginRight: "1rem",
        }}
      />
      <button
        onClick={handleClick}
        disabled={isLoading || !input.trim()}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#000",
          color: "#fff",
          border: "none",
          cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
          opacity: isLoading || !input.trim() ? 0.7 : 1,
        }}
      >
        {isLoading ? "Processing..." : "Clear My Mind"}
      </button>

      <div style={{ marginTop: "2rem" }}>
        <h2>Clarity:</h2>
        <p>{output}</p>
      </div>
    </div>
  )
}

export default App

