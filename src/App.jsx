import { useState } from 'react'
import './App.css'

function App() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const handleClick = async () => {
    const res = await fetch("/.netlify/functions/gpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    })

    const data = await res.json()
    setOutput(data.clarity || "Something went wrong.")
  }

  return (
    <div>
      <h1>🧠 MindMute</h1>
      <p>Turn overthinking into clear next steps.</p>

      <input
        type="text"
        placeholder="Type your thought spiral..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleClick}>Clear My Mind</button>

      <div>
        <h2>Clarity:</h2>
        <p>{output}</p>
      </div>
    </div>
  )
}

export default App
