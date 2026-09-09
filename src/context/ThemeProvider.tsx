import { useSyncExternalStore, useEffect, type ReactNode } from "react"

type Theme = "light" | "dark"

// ── Global theme store (no context, no provider dependency) ─────────────────

function getSnapshot(): Theme {
  try {
    const v = localStorage.getItem("astra-theme")
    if (v === "dark" || v === "light") return v
  } catch {}
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function setTheme(next: Theme) {
  try {
    localStorage.setItem("astra-theme", next)
  } catch {}
  applyClass(next)
  listeners.forEach((cb) => cb())
}

function applyClass(theme: Theme) {
  if (typeof document === "undefined") return
  document.documentElement.classList.toggle("dark", theme === "dark")
}

// ── Public API ──────────────────────────────────────────────────────────────

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "light" as Theme)
  return {
    theme,
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
  }
}

// ThemeProvider is kept as a convenience wrapper that seeds the class on mount.
// It is NOT required for useTheme to work — any component can call useTheme safely.
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyClass(getSnapshot())
  }, [])
  return <>{children}</>
}
