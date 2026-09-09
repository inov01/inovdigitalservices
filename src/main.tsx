import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AppSettingsProvider } from './context/AppSettingsProvider'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppSettingsProvider>
        <App />
      </AppSettingsProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

// Register the service worker so the installed app auto-updates with the site.
// A new deploy is picked up (network-first SW), activated immediately, and the
// page reloads once — so users always run the latest version.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // Re-check for a new version hourly and whenever the tab regains focus.
      setInterval(() => { reg.update().catch(() => {}) }, 60 * 60 * 1000)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {})
      })
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing
        if (!nw) return
        nw.addEventListener('statechange', () => {
          // A new worker is ready while an old one still controls the page.
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            nw.postMessage({ type: 'SKIP_WAITING' })
          }
        })
      })
    }).catch(() => { /* SW unsupported / blocked — app still works online */ })

    // When the new worker takes control, reload once to load fresh assets.
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })
  })
}
