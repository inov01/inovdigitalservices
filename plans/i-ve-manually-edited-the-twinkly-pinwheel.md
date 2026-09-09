# Plan: Fix Vite WebSocket HMR + Wire Astra UI Kit

## Context

Two problems to fix in one pass:

1. **WebSocket HMR failure** — The browser at `makeproxy-c.figma.site` is failing to open a WebSocket to `localhost:3000`. When Vite runs behind the Figma Make proxy, HMR tries to connect directly to the server's local port, which the proxy doesn't forward as WebSocket. The fix is to tell Vite's HMR client to use the proxy's hostname/port (`FIGMA_PUBLIC_URL`) via `wss:443`, exactly as the `base` option already does.

2. **Astra UI Kit wiring** — `package.json` already lists `@figma/astraui-kit@0.1.3` and `@figma/astraui@1.0.0` (matches `<figma_selected_make_kits>`). But per `setup.md`, two things are still missing: the kit's pre-compiled CSS is not imported, and `ThemeProvider` is not in the app root. Without these, kit components silently lose their styles and dark-mode state management.

## Changes

### 1. `vite.config.ts` — add `hmr` to the server block

Inside the `server: { … }` object, add:

```ts
hmr: process.env.FIGMA_PUBLIC_URL
  ? {
      protocol: 'wss',
      host: new URL(process.env.FIGMA_PUBLIC_URL).hostname,
      clientPort: 443,
    }
  : true,
```

This routes the HMR WebSocket through the proxy when running in Figma Make, and leaves local dev unchanged.

### 2. `src/index.css` — import kit styles

Add after `@import 'tailwindcss';` (must stay in the `@import` block before any rules):

```css
@import '@figma/astraui/styles.css';
```

The kit ships pre-compiled CSS — no `@source` rules needed in the Tailwind config.

### 3. `src/main.tsx` — wrap with `ThemeProvider`

```tsx
import { ThemeProvider } from '@figma/astraui'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppSettingsProvider>
        <App />
      </AppSettingsProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
```

`ThemeProvider` manages the `.dark` class on `<html>` and reads `localStorage('astra-theme')`. It must be the outermost provider.

## What is NOT changed

- No existing components are refactored. The existing INOV Digital Services UI (Pricing, Portfolio, Blog, etc.) is untouched.
- `figma.kitAttachments` in `package.json` is not edited — the reconcile CLI owns that field.
- No new dependencies are added — both kit packages are already installed.

## Verification

1. After saving `vite.config.ts`, the Vite dev server restarts. The browser console should no longer show the WebSocket error.
2. Confirm `ThemeProvider` renders without error (app loads normally).
3. Confirm kit CSS loads: open DevTools → Sources → look for `@figma/astraui/styles.css` in the network waterfall.
