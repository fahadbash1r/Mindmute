import { useState } from 'react'
import './App.css'

function App() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const handleClick = async () => {
    try {
      const res = await fetch("/.netlify/functions/gpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      })

      const data = await res.json()
      setOutput(data.clarity || "Something went wrong.")
    } catch (err) {
      setOutput("Error reaching the serverless function.")
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
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#000",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Clear My Mind
      </button>

      <div style={{ marginTop: "2rem" }}>
        <h2>Clarity:</h2>
        <p>{output}</p>
      </div>
    </div>
  )
}

export default App

