import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/** Apply saved/system theme BEFORE React renders (no flash) */
;(function applyInitialTheme() {
  try {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    const theme = saved ?? (systemDark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', theme)
    // Help the UA style scrollbars/form controls correctly
    document.documentElement.style.colorScheme = theme
  } catch { /* ignore */ }
})()

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  throw new Error("Root element not found");
}
