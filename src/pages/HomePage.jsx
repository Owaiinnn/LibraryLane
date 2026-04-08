// ============================================================
// HomePage.jsx — THE MAIN PAGE (displays all books)
// ============================================================
//
// WHAT THIS PAGE DOES:
//   1. Reads the list of book IDs from Context (bookIds + takenIds)
//   2. Fetches detailed book data from the Open Library API for each ID
//   3. Displays two sections:
//      - "Available Books" — books currently in the library
//      - "My Books" — books the user has taken home
//   4. Each book card is clickable — links to DetailPage for that book
//
// KEY CONCEPTS DEMONSTRATED:
//   - useEffect for data fetching (side effects)
//   - async/await with Promise.all for parallel API calls
//   - Conditional rendering (loading state, empty state)
//   - Array .map() to render lists of components
//   - The Open Library API structure
// ============================================================

// useEffect: runs code AFTER the component renders (for side effects like API calls)
// useState: creates reactive state variables that trigger re-renders when changed
import { useEffect, useState } from 'react'

// Link: React Router's <a> tag replacement — navigates without page reload
import { Link } from 'react-router-dom'

// useBooks: our custom hook to access the global book state from Context
import { useBooks } from '../context/BookContext'

function HomePage() {
  // ---- READING FROM CONTEXT ----
  // Destructuring: pulls bookIds and takenIds out of the context value object.
  // This is equivalent to:
  //   const ctx = useBooks()
  //   const bookIds = ctx.bookIds
  //   const takenIds = ctx.takenIds
  //
  // bookIds = array of Open Library work IDs in the library, e.g. ['OL82563W', 'OL45804W']
  // takenIds = array of work IDs the user has taken home
  const { bookIds, takenIds } = useBooks()

  // ---- LOCAL STATE ----
  // These are local to this component (not shared via Context) because
  // no other component needs the fetched book details — only HomePage displays them.
  //
  // books: array of fetched book objects for the library (with title, covers, authorName)
  // takenBooks: array of fetched book objects for books the user has taken
  // loading: boolean flag — true while API calls are in progress
  const [books, setBooks] = useState([])
  const [takenBooks, setTakenBooks] = useState([])
  const [loading, setLoading] = useState(true)

  // ---- DATA FETCHING WITH useEffect ----
  //
  // useEffect(callbackFunction, dependencyArray)
  //
  // HOW useEffect WORKS:
  //   - The callback runs AFTER the component renders to the screen
  //   - The dependency array controls WHEN it re-runs:
  //       []              → run only once (on mount)
  //       [bookIds]       → run again whenever bookIds changes
  //       [bookIds, takenIds] → run again whenever EITHER changes  ← we use this
  //       (no array)      → run after EVERY render (usually a mistake)
  //
  // WHY useEffect FOR API CALLS?
  //   React components are supposed to be "pure" — given the same props/state,
  //   they should return the same JSX. API calls are "side effects" (they
  //   interact with the outside world), so they go in useEffect.
  //
  // WHY NOT async DIRECTLY ON useEffect?
  //   useEffect callbacks cannot be async (React expects them to return
  //   either nothing or a cleanup function, not a Promise). So we define
  //   an async function INSIDE and immediately call it.
  useEffect(() => {
    async function fetchAll() {
      try {
        // ---- HELPER FUNCTION: fetchBook(id) ----
        // Fetches a single book's data from the Open Library API.
        //
        // TWO API CALLS PER BOOK:
        //   1. Fetch the work (book) data:  /works/{id}.json
        //      Returns: { title, covers, authors, description, ... }
        //
        //   2. Fetch the author's name:     /authors/{authorKey}.json
        //      Returns: { name, bio, ... }
        //      The author key comes from the book data (book.authors[0].author.key)
        //
        // WHY TWO CALLS?
        //   Open Library stores books and authors separately. The book
        //   endpoint only gives you the author's KEY (like "/authors/OL23919A"),
        //   not their name. You need a second request to get the actual name.
        //
        // .then(res => res.json()):
        //   fetch() returns a Response object. .json() parses the response
        //   body as JSON and returns a JavaScript object. This is a common
        //   pattern — you'll see it in almost every fetch call.
        const fetchBook = async id => {
          const book = await fetch(`https://openlibrary.org/works/${id}.json`).then(res => res.json())
          let authorName = 'Unknown author'
          // Check if the book has author data before trying to fetch it.
          // Some books in Open Library don't have author information.
          if (book.authors && book.authors[0]) {
            const authorData = await fetch(`https://openlibrary.org${book.authors[0].author.key}.json`).then(res => res.json())
            authorName = authorData.name
          }
          // Spread syntax: { ...book, authorName }
          // Creates a NEW object with all properties from 'book' PLUS
          // the authorName we just fetched. If 'book' already had an
          // 'authorName' property, ours would overwrite it.
          return { ...book, authorName }
        }

        // ---- PARALLEL FETCHING WITH Promise.all ----
        //
        // Promise.all([promise1, promise2]) waits for ALL promises to
        // resolve, then returns an array of their results.
        //
        // INNER Promise.all: bookIds.map(fetchBook)
        //   .map() transforms each ID into a Promise (the fetch call).
        //   Promise.all waits for ALL books to finish loading.
        //   This is MUCH faster than fetching them one-by-one (sequentially)
        //   because all requests go out at the same time (in parallel).
        //
        // OUTER Promise.all: runs the library fetch and taken fetch in parallel.
        //   [libraryResults, takenResults] uses array destructuring to
        //   give names to each result.
        const [libraryResults, takenResults] = await Promise.all([
          Promise.all(bookIds.map(fetchBook)),
          Promise.all(takenIds.map(fetchBook)),
        ])

        // Update state with the fetched data — this triggers a re-render
        setBooks(libraryResults)
        setTakenBooks(takenResults)
      } catch (err) {
        // If any fetch fails (network error, API down, etc.), log it
        // but don't crash the app. The user will just see empty lists.
        console.error('Failed to fetch books:', err)
      }
      // Set loading to false whether the fetch succeeded or failed,
      // so the loading spinner goes away either way.
      setLoading(false)
    }

    fetchAll()
  }, [bookIds, takenIds])
  // ^ DEPENDENCY ARRAY: re-run this effect whenever bookIds or takenIds change.
  // For example, when the user adds a book via SearchPage, bookIds updates,
  // and this effect re-runs to fetch the new book's data.

  // ---- JSX (the component's rendered output) ----
  return (
    <div>
      {/* ---- HERO SECTION ----
          A welcome banner explaining how the app works.
          This is always visible regardless of loading state. */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-6 mb-8">
        <h1 className="text-2xl font-bold text-green-800 mb-3">Welcome to LibraryLane</h1>
        <ul className="text-gray-600 space-y-1">
          <li>Browse available books and read what they're about</li>
          <li>Take a book home and hand it back in when you're done</li>
          <li>Want to donate a book? Search for it and add it to the library</li>
        </ul>
      </div>

      {/* ---- CONDITIONAL RENDERING: LOADING STATE ----
          The && operator is a JSX pattern for conditional rendering:
            condition && <JSX />
          If condition is true, the JSX renders. If false, nothing renders.
          This is shorter than a ternary when you don't need an "else" case. */}
      {loading && <p className="text-gray-500 text-center mt-10">Loading books...</p>}

      {/* ---- MAIN CONTENT (only shown when not loading) ----
          !loading && (...) — the opposite of the loading check above.

          The <> and </> are React "Fragments." They let you return multiple
          elements without adding an extra <div> to the DOM. React requires
          that a component returns a single root element, and Fragments
          provide that wrapper invisibly. */}
      {!loading && (
        <>
          {/* ---- SECTION HEADER: Available Books ----
              Shows the count of books. Uses a ternary to handle singular/plural:
              books.length === 1 ? 'book' : 'books'
              → "1 book" vs "3 books" */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Available Books</h2>
            <span className="text-sm text-gray-400">{books.length} {books.length === 1 ? 'book' : 'books'}</span>
          </div>

          {/* ---- CONDITIONAL RENDERING: EMPTY STATE vs BOOK GRID ----
              Ternary operator: condition ? <IfTrue /> : <IfFalse />
              If there are no books, show a message with a link to add one.
              Otherwise, render the grid of book cards. */}
          {books.length === 0 ? (
            // EMPTY STATE — shown when the library has no books
            <div className="text-center py-10 text-gray-400">
              <p>No books available right now.</p>
              <Link to="/search" className="text-green-700 underline mt-2 inline-block">Add the first one</Link>
            </div>
          ) : (
            // ---- BOOK GRID ----
            // Tailwind's responsive grid:
            //   grid              → display: grid
            //   grid-cols-1       → 1 column by default (mobile)
            //   sm:grid-cols-2    → 2 columns on screens >= 640px (tablet)
            //   lg:grid-cols-3    → 3 columns on screens >= 1024px (desktop)
            //   gap-4             → 1rem gap between grid items
            //
            // The sm: and lg: prefixes are Tailwind's responsive breakpoints.
            // Tailwind is "mobile-first" — base classes apply to all screens,
            // and prefixed classes override at larger screen sizes.
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
              {/* ---- RENDERING A LIST WITH .map() ----
                  books.map((book, i) => ...) transforms each book object
                  into a JSX card element.

                  WHY key={bookIds[i]}?
                    React requires a unique "key" prop on each element in a list.
                    Keys help React's reconciliation algorithm figure out which
                    items changed, were added, or removed — so it can update the
                    DOM efficiently instead of re-rendering everything.
                    We use the book's Open Library ID as the key because it's unique.

                  NOTE: Using the array index (i) as a key is generally discouraged
                  because if the list is reordered, React can get confused. Here we
                  use bookIds[i] which is the actual unique ID. */}
              {books.map((book, i) => (
                <Link
                  key={bookIds[i]}
                  to={`/book/${bookIds[i]}`}
                  className="border rounded-xl overflow-hidden hover:shadow-md hover:border-green-400 transition"
                >
                  {/* COVER IMAGE — conditional rendering with ternary:
                      If the book has a cover image ID, show the image.
                      Otherwise, show a placeholder div with a book emoji.

                      The cover URL format is from Open Library's Covers API:
                        https://covers.openlibrary.org/b/id/{coverId}-M.jpg
                      -M means "medium" size. Other options: -S (small), -L (large) */}
                  {book.covers && book.covers[0] ? (
                    <img
                      src={`https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`}
                      alt={book.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-300 text-4xl">
                      📖
                    </div>
                  )}
                  {/* Book title and author name */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg leading-snug mb-1">{book.title}</h3>
                    <p className="text-sm text-gray-500">{book.authorName}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ---- SECTION: My Books (Taken Books) ----
              Only renders if the user has taken at least one book.
              takenBooks.length > 0 && (...) — conditional rendering.

              This section uses the exact same card layout as "Available Books"
              but with slightly different styling (opacity-80 makes cards faded
              to visually distinguish them from available books). */}
          {takenBooks.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">My Books</h2>
                <span className="text-sm text-gray-400">{takenBooks.length} {takenBooks.length === 1 ? 'book' : 'books'}</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {takenBooks.map((book, i) => (
                  <Link
                    key={takenIds[i]}
                    to={`/book/${takenIds[i]}`}
                    className="border rounded-xl overflow-hidden hover:shadow-md hover:border-gray-300 transition opacity-80"
                  >
                    {book.covers && book.covers[0] ? (
                      <img
                        src={`https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`}
                        alt={book.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-300 text-4xl">
                        📖
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg leading-snug mb-1">{book.title}</h3>
                      <p className="text-sm text-gray-500">{book.authorName}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default HomePage
