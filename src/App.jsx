// ============================================================
// App.jsx — THE APPLICATION SHELL (Layout + Routing)
// ============================================================
// This component defines:
//   1. The overall page layout (Navbar at top, main content below)
//   2. Client-side routing — which page component to show based on the URL
//
// WHAT IS CLIENT-SIDE ROUTING?
//   In a traditional website, clicking a link sends a request to the server,
//   which responds with a whole new HTML page. That causes a full page reload.
//
//   In a Single Page Application (SPA) like this one, the browser loads ONE
//   HTML page (index.html) and then JavaScript swaps out parts of the page
//   when the URL changes — no server round-trip, no page reload. This is
//   what react-router-dom does for us.
//
// THE THREE ROUTES:
//   /           → HomePage     (shows all available books and taken books)
//   /book/:id   → DetailPage   (shows details for one specific book)
//   /search     → SearchPage   (search Open Library API and add books)
//
// WHAT IS ":id" IN /book/:id?
//   The colon means it's a URL parameter (a dynamic segment).
//   For example, /book/OL82563W would match this route, and inside
//   DetailPage you can read the value "OL82563W" using useParams().
// ============================================================

// BrowserRouter: wraps the entire app to enable client-side routing.
//   It listens for URL changes and tells React Router which <Route> matches.
//
// Routes: a container that holds all <Route> definitions.
//   React Router checks each <Route> and renders the FIRST one whose
//   "path" matches the current URL.
//
// Route: maps a URL path to a React component.
//   path="/"          → exact match for the homepage
//   path="/book/:id"  → matches any URL like /book/OL82563W
//   path="/search"    → exact match for the search page
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Import the page/component files
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import DetailPage from './pages/DetailPage'
import SearchPage from './pages/SearchPage'

function App() {
  return (
    // BrowserRouter must wrap everything that uses routing (Links, Routes, etc.)
    <BrowserRouter>
      {/* Navbar sits OUTSIDE <Routes> so it appears on EVERY page.
          If it were inside a <Route>, it would only show on that one route. */}
      <Navbar />

      {/* <main> is a semantic HTML5 element — it tells the browser (and screen readers)
          "this is the primary content of the page."

          The Tailwind classes here:
            max-w-4xl  → limit the content width to 896px (keeps it readable)
            mx-auto    → center it horizontally (margin-left: auto; margin-right: auto)
            px-4       → horizontal padding of 1rem (16px)
            py-6       → vertical padding of 1.5rem (24px) */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Routes evaluates all child <Route> elements and renders the one
            whose path matches the current browser URL. Only ONE route renders
            at a time (the first match). */}
        <Routes>
          {/* path="/" matches the root URL (e.g. http://localhost:5173/)
              element={<HomePage />} tells React Router what to render when matched */}
          <Route path="/" element={<HomePage />} />

          {/* path="/book/:id" — the :id part is a dynamic parameter.
              When a user visits /book/OL82563W, DetailPage can call useParams()
              to get { id: "OL82563W" } and use it to fetch that book's data */}
          <Route path="/book/:id" element={<DetailPage />} />

          {/* path="/search" — a static route for the search/add-book page */}
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

// "export default" means when another file does `import App from './App'`,
// they get THIS function. Each file can have one default export.
export default App
