import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { App } from "./App"
import { resolveSpaRedirect } from "./lib/spaRedirect"

const container = document.getElementById("root")

if (!container) {
  throw new Error("Root element not found")
}

const redirectUrl = resolveSpaRedirect(
  {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  },
  import.meta.env.BASE_URL,
)

if (redirectUrl) {
  window.history.replaceState(null, "", redirectUrl)
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
