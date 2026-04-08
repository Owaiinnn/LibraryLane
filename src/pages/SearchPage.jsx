// ============================================================
// SearchPage.jsx — SEARCH & ADD BOOKS PAGE
// ============================================================
//
// WHAT THIS PAGE DOES:
//   1. Provides a search form where the user types a book title/query
//   2. Sends the query to the Open Library Search API
//   3. Displays up to 10 results
//   4. Each result has an "Add" button to add the book to the library
//   5. If a book is already in the library, the button is disabled ("Added")
//
// KEY CONCEPTS DEMONSTRATED:
//   - Form handling in React (controlled components)
//   - Preventing default form behaviour (e.preventDefault)
//   - API calls triggered by user action (not useEffect)
//   - Disabling buttons based on state
//   - encodeURIComponent for safe URL construction
// ============================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBooks } from '../context/BookContext'

function SearchPage() {
  // ---- CONTEXT: get bookIds and addBook from the global state ----
  // bookIds: needed to check if a search result is already in the library
  // addBook: function to add a new book to the library
  const { bookIds, addBook } = useBooks()

  // ---- LOCAL STATE ----
  // query: the text the user has typed into the search input (controlled component)
  // results: array of book objects returned by the Open Library Search API
  // loading: true while the search API call is in progress
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // ---- FORM SUBMISSION HANDLER ----
  //
  // WHAT IS e.preventDefault()?
  //   By default, submitting an HTML <form> causes a full page reload
  //   (the browser tries to send a GET/POST request to the server).
  //   e.preventDefault() stops this default behaviour so we can handle
  //   the submission with JavaScript instead (staying in our SPA).
  //
  // WHY if (!query.trim()) return?
  //   .trim() removes whitespace from both ends of the string.
  //   If the user typed only spaces (or nothing), we skip the search.
  //   This is a guard clause — it exits the function early.
  //
  // WHAT IS encodeURIComponent()?
  //   It converts special characters into URL-safe equivalents.
  //   For example, "Harry Potter" → "Harry%20Potter"
  //   Without this, spaces and special characters would break the URL.
  //
  // THE SEARCH API:
  //   https://openlibrary.org/search.json?q=QUERY&limit=10
  //   Returns: { docs: [ { key, title, author_name, ... }, ... ] }
  //   - docs is an array of search results
  //   - key looks like "/works/OL82563W"
  //   - limit=10 restricts results to 10 (avoids loading too much data)
  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`)
    const data = await res.json()
    // data.docs is the array of matching books from the API
    setResults(data.docs)
    setLoading(false)
  }

  // ---- ADD BOOK HANDLER ----
  //
  // The search API returns the book key as "/works/OL82563W",
  // but our app stores just the ID part: "OL82563W".
  // .replace('/works/', '') strips the prefix to get the clean ID.
  //
  // Then we call addBook(id) from Context, which:
  //   1. Adds the ID to the bookIds array
  //   2. Saves it to localStorage
  //   3. Triggers a re-render (so the button updates to "Added")
  function handleAdd(book) {
    const id = book.key.replace('/works/', '')
    addBook(id)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add a Book</h1>

      {/* ---- SEARCH FORM ----
          onSubmit={handleSearch} — called when the user presses Enter
          or clicks the Search button.

          WHAT IS A "CONTROLLED COMPONENT"?
            The <input>'s value is controlled by React state (value={query}).
            Every keystroke triggers onChange, which updates state via setQuery,
            which re-renders the input with the new value.
            This means React is always the "source of truth" for the input value.

            The alternative is an "uncontrolled component" where the DOM manages
            the input value and you read it with a ref. Controlled is preferred
            because it gives you more control over validation, formatting, etc. */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for a book..."
          className="border rounded-lg px-4 py-2 flex-1 outline-none focus:ring-2 focus:ring-green-600"
        />
        {/* type="submit" means clicking this button triggers the form's onSubmit.
            Pressing Enter in the text input also triggers it (default form behaviour). */}
        <button
          type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition"
        >
          Search
        </button>
      </form>

      {/* Loading indicator — only shown while the API call is in progress */}
      {loading && <p className="text-gray-500">Searching...</p>}

      {/* ---- SEARCH RESULTS LIST ----
          results.map() transforms each API result object into a list item.

          For each result:
            1. Extract the book ID from key ("/works/OL82563W" → "OL82563W")
            2. Check if it's already in the library (alreadyAdded)
            3. Render a row with the title, author, and an Add/Added button */}
      <ul className="space-y-3">
        {results.map(book => {
          // Extract the clean ID from the API's key format
          const id = book.key.replace('/works/', '')

          // Check if this book is already in our library.
          // .includes() searches the array and returns true/false.
          const alreadyAdded = bookIds.includes(id)

          return (
            <li key={id} className="border rounded-lg p-4 flex justify-between items-center gap-4">
              {/* Book title and author — clicking navigates to the detail page */}
              <Link to={`/book/${id}`} className="flex-1 hover:underline">
                <p className="font-semibold">{book.title}</p>
                {/* The search API returns author_name as an array (a book can
                    have multiple authors). We just show the first one.
                    The ?. (optional chaining) and ternary handle the case
                    where author_name might be undefined. */}
                <p className="text-sm text-gray-500">{book.author_name ? book.author_name[0] : 'Unknown author'}</p>
              </Link>

              {/* ADD BUTTON
                  disabled={alreadyAdded}: HTML's disabled attribute prevents clicks
                  and React also prevents the onClick from firing.

                  Tailwind's disabled: prefix applies styles only when disabled:
                    disabled:opacity-40         → makes the button faded
                    disabled:cursor-not-allowed  → shows a "no" cursor on hover

                  The button text changes based on whether the book is already added:
                    alreadyAdded ? 'Added' : 'Add' */}
              <button
                onClick={() => handleAdd(book)}
                disabled={alreadyAdded}
                className="text-sm px-3 py-1 rounded-lg border border-green-700 text-green-700 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
              >
                {alreadyAdded ? 'Added' : 'Add'}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default SearchPage
