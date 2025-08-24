import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

function App() {
  const [health, setHealth] = useState(null)
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '/api'

  useEffect(() => {
    fetch(`${backendUrl}/health`)
      .then(r => r.json())
      .then(setHealth)
      .catch(err => setHealth({ error: err.message }))
  }, [])

  return (
    <div style={{fontFamily:'Inter, system-ui', padding:16}}>
      <h1>LOS Frontend</h1>
      <p>Backend URL: {backendUrl}</p>
      <pre>{JSON.stringify(health, null, 2)}</pre>
      <button onClick={async () => {
        const r = await fetch(`${backendUrl}/integration/ping`)
        const d = await r.json()
        alert(JSON.stringify(d))
      }}>Ping Integration</button>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
