// ============================================================
// DetailPage.jsx — INDIVIDUAL BOOK DETAIL PAGE
// ============================================================
//
// WHAT THIS PAGE DOES:
//   1. Reads the book ID from the URL (e.g., /book/OL82563W → id = "OL82563W")
//   2. Fetches the book's full details and author info from Open Library
//   3. Displays the book cover, title, author, publish date, and description
//   4. Shows one of three action buttons depending on the book's status:
//      - "Take this book"   → if the book is in the library (available)
//      - "Hand back in"     → if the user has already taken this book
//      - "Add to library"   → if the book is neither (found via search)
//
// KEY CONCEPTS DEMONSTRATED:
//   - useParams() to read URL parameters from the route
//   - useNavigate() for programmatic navigation (redirecting the user)
//   - Early returns for loading/error states
//   - Handling API data that can have different shapes (description object vs string)
// ============================================================

// useEffect: for fetching data after the component mounts
// useState: for storing the fetched book data, author data, and loading state
import { useEffect, useState } from 'react'

// useParams: React Router hook to read URL parameters (the :id from the route)
// useNavigate: React Router hook to programmatically change the URL
//   (like clicking a link, but triggered by code instead of a user click)
import { useParams, useNavigate } from 'react-router-dom'

// useBooks: our custom hook to access the global book state
import { useBooks } from '../context/BookContext'

function DetailPage() {
  // ---- READ THE BOOK ID FROM THE URL ----
  // In App.jsx, we defined the route as: <Route path="/book/:id" ... />
  // useParams() returns an object of all URL parameters.
  // If the URL is /book/OL82563W, then { id } destructures to id = "OL82563W"
  const { id } = useParams()

  // ---- NAVIGATION FUNCTION ----
  // useNavigate() returns a function that lets us redirect the user.
  //   navigate('/')      → go to the homepage
  //   navigate(-1)       → go back one page in browser history (like clicking "Back")
  // We use this after taking/adding a book to send the user back to the homepage.
  const navigate = useNavigate()

  // ---- CONTEXT: get all the book state and functions we need ----
  // bookIds:    to check if this book is currently in the library
  // takenIds:   to check if the user has already taken this book
  // addBook:    to add this book to the library (or hand it back in)
  // removeBook: to take this book out of the library
  const { bookIds, takenIds, addBook, removeBook } = useBooks()

  // ---- LOCAL STATE ----
  // book: the full book data object fetched from the API (or null if not loaded yet)
  // author: the author data object (or null)
  // loading: boolean flag for the loading state
  const [book, setBook] = useState(null)
  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)

  // ---- DERIVED STATE ----
  // These are computed from the context state — they're not stored in useState
  // because they can be calculated from existing data. This avoids having
  // duplicate sources of truth.
  //
  // .includes(id) checks if the current book's ID exists in the respective array.
  const isInLibrary = bookIds.includes(id)   // Is this book available in the library?
  const isTaken = takenIds.includes(id)       // Has the user taken this book?

  // ---- FETCH BOOK DATA ON MOUNT ----
  // Same pattern as HomePage: define an async function inside useEffect and call it.
  //
  // Dependency array: [id]
  //   This effect re-runs if the URL parameter changes (e.g., the user navigates
  //   from /book/OL82563W to /book/OL45804W without going back to the homepage).
  //   In practice this rarely happens, but it's correct to include it.
  useEffect(() => {
    async function fetchBook() {
      try {
        // Fetch the book's data from Open Library
        const bookData = await fetch(`https://openlibrary.org/works/${id}.json`).then(res => res.json())
        setBook(bookData)

        // Fetch the author's data if available
        if (bookData.authors && bookData.authors[0]) {
          const authorData = await fetch(`https://openlibrary.org${bookData.authors[0].author.key}.json`).then(res => res.json())
          setAuthor(authorData)
        }
      } catch (err) {
        console.error('Failed to fetch book:', err)
      }
      setLoading(false)
    }

    fetchBook()
  }, [id])

  // ---- ACTION HANDLERS ----

  // handleTake: called when the user clicks "Take this book"
  // 1. removeBook(id) moves the book from bookIds → takenIds in Context
  // 2. navigate('/') redirects the user to the homepage so they can see
  //    the book now appears under "My Books" instead of "Available Books"
  function handleTake() {
    removeBook(id)
    navigate('/')
  }

  // handleAdd: called when the user clicks "Hand back in" or "Add to library"
  // 1. addBook(id) adds the book to bookIds (and removes from takenIds if applicable)
  // 2. navigate('/') sends the user back to the homepage
  function handleAdd() {
    addBook(id)
    navigate('/')
  }

  // ---- EARLY RETURNS ----
  // These are a common React pattern for handling loading and error states.
  // Instead of wrapping the entire JSX in conditionals, we return early
  // and the rest of the function doesn't execute.
  //
  // WHY THIS WORKS:
  //   A React component is just a function. If you return JSX early,
  //   React renders that and ignores everything below.
  if (loading) return <p className="text-gray-500 mt-10 text-center">Loading...</p>
  if (!book) return <p className="text-gray-500 mt-10 text-center">Book not found.</p>

  // ---- EXTRACT DESCRIPTION ----
  // Open Library's API is inconsistent: the description field can be either:
  //   1. A plain string: "This is the description..."
  //   2. An object: { type: "/type/text", value: "This is the description..." }
  //
  // typeof book.description === 'object' checks which format we got.
  // If it's an object, we extract the .value property.
  // If it's already a string, we use it directly.
  // If it's undefined (no description), this evaluates to undefined.
  const description = typeof book.description === 'object' ? book.description.value : book.description

  // Extract the cover image ID (first cover in the array, if any)
  // The && operator short-circuits: if book.covers is undefined/null,
  // it won't try to access [0] (which would throw an error).
  const coverId = book.covers && book.covers[0]

  return (
    <div className="max-w-2xl">
      {/* ---- BACK BUTTON ----
          navigate(-1) goes back one entry in the browser's history stack.
          This works like the browser's back button. The -1 means "go back
          one page." You could use -2 to go back two pages, etc. */}
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:underline mb-8 block">
        &larr; Back
      </button>

      {/* ---- BOOK HEADER: Cover + Title + Author + Date ----
          Flexbox layout with cover image on the left and text on the right.

          "shrink-0" on the image prevents it from shrinking when the flex
          container gets narrow — it stays at its set width (w-32 = 8rem). */}
      <div className="flex gap-6 mb-8">
        {/* Cover image — uses -L (large) size from Open Library Covers API.
            The ternary renders either the actual cover or a placeholder. */}
        {coverId ? (
          <img
            src={`https://covers.openlibrary.org/b/id/${coverId}-L.jpg`}
            alt={book.title}
            className="w-32 rounded-lg shadow-md shrink-0"
          />
        ) : (
          <div className="w-32 h-44 bg-gray-100 rounded-lg flex items-center justify-center text-4xl shrink-0">
            📖
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold mb-1">{book.title}</h1>
          {/* Only show author name if we successfully fetched it.
              author && <p>...</p> — if author is null, this renders nothing. */}
          {author && <p className="text-green-700 font-medium mb-2">{author.name}</p>}
          {/* Only show publish date if the API provided one */}
          {book.first_publish_date && (
            <p className="text-sm text-gray-400">First published: {book.first_publish_date}</p>
          )}
        </div>
      </div>

      {/* ---- DESCRIPTION ----
          Only renders if a description exists. The && pattern again. */}
      {description && (
        <p className="text-gray-600 leading-relaxed mb-8">{description}</p>
      )}

      {/* ---- ACTION BUTTON ----
          Three possible states, handled with a chained ternary:

          isInLibrary ? (Take button)     → the book is available, user can take it
          : isTaken   ? (Hand back button) → user already has it, can return it
          :             (Add button)       → book isn't in library at all, can add it

          CHAINED TERNARY EXPLAINED:
            condition1 ? result1
            : condition2 ? result2
            : result3

          This is like an if/else if/else chain:
            if (isInLibrary)      → show "Take this book"
            else if (isTaken)     → show "Hand back in"
            else                  → show "Add to library"

          Each button calls a different handler:
            - handleTake: removes from library, adds to taken, goes to homepage
            - handleAdd:  adds to library (removes from taken if applicable), goes to homepage */}
      {isInLibrary ? (
        <button
          onClick={handleTake}
          className="bg-green-700 text-white px-6 py-2.5 rounded-lg hover:bg-green-800 transition font-medium"
        >
          Take this book
        </button>
      ) : isTaken ? (
        <button
          onClick={handleAdd}
          className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Hand back in
        </button>
      ) : (
        <button
          onClick={handleAdd}
          className="bg-green-700 text-white px-6 py-2.5 rounded-lg hover:bg-green-800 transition font-medium"
        >
          Add to library
        </button>
      )}
    </div>
  )
}

export default DetailPage
