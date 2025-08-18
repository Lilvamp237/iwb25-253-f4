import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// DIAGNOSTIC: show a blocking alert *before* React
console.log('main.tsx: script loaded')
alert('JS loaded ✅')  // you must see this popup on refresh

const el = document.getElementById('root')
if (!el) {
  alert('❌ #root not found');  // should NOT trigger if index.html is correct
  throw new Error('#root not found')
}

createRoot(el).render(
  <StrictMode>
    <div style={{ padding: 24, fontFamily: 'system-ui, Arial' }}>
      <h1 style={{ margin: 0 }}>It works 🎉</h1>
      <p style={{ marginTop: 8 }}>JS + React are running.</p>
    </div>
  </StrictMode>
)
