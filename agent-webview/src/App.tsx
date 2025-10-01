import { useState } from 'react'
import './App.css'
import { useEvent } from 'react-use'

function App() {
  const [message, setMessage] = useState("")
  useEvent("message", (e: MessageEvent<string>) => {
    setMessage(e.data)
    console.log(e.data)
  })

  return (
    <>
      <h1>{message}</h1>
      <div className="card">
        <button onClick={() => setMessage("helloWorld")}>
          Send Message
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
