// ============================================================
// Navbar.jsx — THE NAVIGATION BAR COMPONENT
// ============================================================
//
// This is a simple, presentational component — it doesn't manage any
// state of its own. It just renders the navigation bar at the top of
// every page.
//
// WHAT IT DOES:
//   - Shows the app logo/name ("LibraryLane") as a clickable link to home
//   - Shows two navigation links: "Home" and "Add Book"
//   - Highlights (underlines) whichever link matches the current page
//
// KEY CONCEPTS:
//   - <Link> vs <a>:  In React Router, you use <Link> instead of <a> tags.
//     A normal <a> tag causes a full page reload (the browser fetches a new
//     HTML page from the server). <Link> intercepts the click and updates
//     the URL without reloading — this is what makes it a Single Page App.
//
//   - useLocation(): A React Router hook that returns an object with info
//     about the current URL. We use location.pathname to check which page
//     the user is on, so we can underline the active nav link.
//
//   - Conditional className with template literals:
//     `${condition ? 'classA' : 'classB'}`
//     This is how we dynamically apply CSS classes based on state.
//     If the condition is true, 'classA' is added; otherwise 'classB'.
// ============================================================

// Link: React Router's replacement for <a> tags (no page reload on click)
// useLocation: hook to read the current URL path
import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  // useLocation() returns an object like: { pathname: "/search", search: "", hash: "" }
  // We only care about pathname — it tells us which page the user is on.
  const location = useLocation()

  return (
    // <nav> is a semantic HTML5 element — it tells browsers and screen readers
    // "this contains navigation links."
    //
    // Tailwind classes explained:
    //   bg-green-700       → dark green background
    //   text-white         → white text colour
    //   px-6               → horizontal padding (1.5rem / 24px)
    //   py-4               → vertical padding (1rem / 16px)
    //   flex               → display: flex (enables flexbox layout)
    //   items-center       → vertically centre the children
    //   justify-between    → push children to opposite ends (logo left, links right)
    <nav className="bg-green-700 text-white px-6 py-4 flex items-center justify-between">
      {/* Logo/brand — clicking it takes you to the homepage.
          "tracking-tight" reduces letter-spacing for a compact look. */}
      <Link to="/" className="text-xl font-bold tracking-tight">
        LibraryLane
      </Link>

      {/* Navigation links container.
          "gap-6" adds 1.5rem spacing between the two links. */}
      <div className="flex gap-6">
        {/* HOME LINK
            The className uses a template literal (backticks) to conditionally
            add 'underline' when the user is on the homepage (pathname === '/').
            This gives visual feedback about which page is active.

            BREAKDOWN OF THE EXPRESSION:
              location.pathname === '/'    → is the user on the homepage?
              ? 'underline'                → if yes, add underline class
              : ''                         → if no, add nothing */}
        <Link
          to="/"
          className={`text-sm font-medium hover:underline ${location.pathname === '/' ? 'underline' : ''}`}
        >
          Home
        </Link>

        {/* ADD BOOK LINK — same pattern as above but checks for '/search' */}
        <Link
          to="/search"
          className={`text-sm font-medium hover:underline ${location.pathname === '/search' ? 'underline' : ''}`}
        >
          Add Book
        </Link>
      </div>
    </nav>
  )
}

// Export as default so other files can import it with:
//   import Navbar from './components/Navbar'
export default Navbar
