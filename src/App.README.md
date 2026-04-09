# App.jsx — Application Shell & Routing

## Language

JavaScript (ES6+) with JSX syntax. Uses the `react-router-dom` library for client-side routing.

## What This File Does

App.jsx is the main layout component. It defines:
1. **The page layout** — Navbar always at the top, page content below
2. **The routes** — which component to show based on the current URL

## What is Client-Side Routing?

In a **traditional website**, clicking a link sends a request to the server, which responds with a whole new HTML page. The browser fully reloads.

In a **Single Page Application (SPA)** like this one, the browser loads ONE HTML page (`index.html`) and then JavaScript swaps out components when the URL changes. No server round-trip, no page reload. The page feels instant.

`react-router-dom` is the library that makes this work.

## Line-by-Line Breakdown

### Imports

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
```
Three named imports from React Router:
- **`BrowserRouter`** — wraps the entire app to enable routing. It listens to the browser's URL and tells React Router when it changes. Uses the History API under the hood (`pushState`, `popstate` events).
- **`Routes`** — a container that holds all `<Route>` definitions. It checks each one and renders the FIRST route whose path matches the current URL.
- **`Route`** — maps a URL path to a React component.

### The Component

```jsx
function App() {
  return (
    <BrowserRouter>
```
- `BrowserRouter` MUST wrap everything that uses routing features (Links, Routes, useNavigate, useParams, useLocation)
- This is why it's placed here in App, which is near the top of the component tree

```jsx
      <Navbar />
```
- Navbar sits OUTSIDE the `<Routes>` block, so it renders on EVERY page
- If it were inside a `<Route>`, it would only show on that specific route

```jsx
      <main className="max-w-4xl mx-auto px-4 py-6">
```
- `<main>` is a semantic HTML5 element — tells browsers and screen readers "this is the primary content"
- Tailwind classes:
  - `max-w-4xl` → maximum width of 896px (keeps content readable, not stretched across huge screens)
  - `mx-auto` → `margin-left: auto; margin-right: auto` → centres the content horizontally
  - `px-4` → horizontal padding of 1rem (16px)
  - `py-6` → vertical padding of 1.5rem (24px)

```jsx
        <Routes>
          <Route path="/" element={<HomePage />} />
```
- `path="/"` matches the root URL (e.g., `http://localhost:5173/`)
- `element={<HomePage />}` tells React Router what component to render when matched

```jsx
          <Route path="/book/:id" element={<DetailPage />} />
```
- The `:id` is a **URL parameter** (dynamic segment)
- When a user visits `/book/OL82563W`, this route matches
- Inside DetailPage, calling `useParams()` returns `{ id: "OL82563W" }`
- The colon is what tells React Router "this part is variable, capture its value"

```jsx
          <Route path="/search" element={<SearchPage />} />
```
- A static route — only matches the exact URL `/search`

### Export

```jsx
export default App
```
- `export default` means when another file writes `import App from './App'`, they get this function
- Each file can have ONE default export (but unlimited named exports)

## Symbols Used

| Symbol | Where | Meaning |
|---|---|---|
| `{ BrowserRouter, Routes, Route }` | Import | Named imports — pulling three specific exports from the package |
| `<Navbar />` | JSX | Self-closing tag — renders the Navbar component with no children |
| `<Route path="/" element={...} />` | JSX | Route config — `path` is the URL pattern, `element` is what to render |
| `:id` in `"/book/:id"` | Route path | URL parameter — a dynamic segment that captures part of the URL |
| `className="..."` | JSX attribute | The JSX version of HTML's `class` (because `class` is a reserved word in JS) |
