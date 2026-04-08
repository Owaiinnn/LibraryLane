// ============================================================
// main.jsx — THE ENTRY POINT OF THE ENTIRE APPLICATION
// ============================================================
// This is where React boots up. Think of it like the "main()" function
// in a C or Java program — it's the first piece of YOUR code that runs.
//
// HOW IT WORKS:
//   1. The browser loads index.html
//   2. index.html has a <div id="root"></div> and a <script> tag pointing here
//   3. This file grabs that "root" div and tells React to render into it
//
// WHAT IS RENDERED (from outermost to innermost):
//   <StrictMode>           — a development helper (see note below)
//     <BookProvider>        — our custom context provider (global state)
//       <App />             — the main application component
//     </BookProvider>
//   </StrictMode>
//
// WHY THIS ORDER MATTERS:
//   - BookProvider wraps App so that EVERY component inside App
//     can access the shared book data (via React Context).
//   - If BookProvider was inside App instead, you'd have to pass
//     data down manually as props — context avoids this "prop drilling".
// ============================================================

// StrictMode is a React wrapper that helps catch bugs during development.
// It does NOT render any visible UI — it just enables extra warnings and
// double-invokes certain functions (like useEffect) to surface side-effect bugs.
// It is automatically removed in production builds, so it has zero performance cost.
import { StrictMode } from 'react'

// createRoot is the React 18+ way to mount a React app into the DOM.
// (The older way was ReactDOM.render() — you might still see that in tutorials.)
import { createRoot } from 'react-dom/client'

// Global CSS — Tailwind's base styles are imported here via @import "tailwindcss"
import './index.css'

// The root App component that sets up routing (see App.jsx)
import App from './App.jsx'

// BookProvider gives every child component access to the shared book state
// (the list of books in the library, taken books, and functions to add/remove them).
import { BookProvider } from './context/BookContext.jsx'

// createRoot(document.getElementById('root'))
//   — Finds the <div id="root"> in index.html
//   — Creates a React root, which is the container React will manage
//
// .render(...)
//   — Tells React WHAT to render into that container
//   — This only runs ONCE when the page loads; after that, React handles
//     all updates internally via its reconciliation algorithm (the "virtual DOM diff")
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BookProvider>
      <App />
    </BookProvider>
  </StrictMode>,
)
