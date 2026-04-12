import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBooks } from '../context/BookContext'

function HomePage() {
  const { bookIds, takenIds } = useBooks() // destructuring — pulls bookIds and takenIds out of context

  // useState — creates a variable that React watches. when it changes, the page re-renders
  const [books, setBooks] = useState([])       // books = current value, setBooks = function to update it
  const [takenBooks, setTakenBooks] = useState([])
  const [loading, setLoading] = useState(true)

  // useEffect — runs code AFTER the component has rendered. used for things like API calls
  // you can't fetch data during render itself, so useEffect is where side effects go
  useEffect(() => {
    // async — marks a function so you can use await inside it
    // await — pauses the function until the Promise resolves (e.g. until the fetch finishes)
    async function fetchAll() {
      try {
        const fetchBook = async id => {
          // fetch() — sends an HTTP request to a URL and returns a Promise
          // .then(res => res.json()) — once the response arrives, parse it as JSON
          const book = await fetch(`https://openlibrary.org/works/${id}.json`).then(res => res.json())
          let authorName = 'Unknown author'
          if (book.authors && book.authors[0]) {
            const authorData = await fetch(`https://openlibrary.org${book.authors[0].author.key}.json`).then(res => res.json())
            authorName = authorData.name
          }
          return { ...book, authorName } // spread — copies all book properties into a new object and adds authorName
        }

        // Promise.all — sends all fetch requests at the same time instead of one by one
        const [libraryResults, takenResults] = await Promise.all([
          Promise.all(bookIds.map(fetchBook)), // .map() turns the id array into an array of Promises
          Promise.all(takenIds.map(fetchBook)),
        ])

        setBooks(libraryResults)
        setTakenBooks(takenResults)
      } catch (err) { // try/catch — if anything inside try throws an error, catch handles it instead of crashing
        console.error('Failed to fetch books:', err)
      }
      setLoading(false)
    }

    fetchAll()
  }, [bookIds, takenIds]) // dependency array — re-runs whenever bookIds or takenIds change

  return (
    <div>
      <div className="bg-green-50 border border-green-100 rounded-xl p-6 mb-8">
        <h1 className="text-2xl font-bold text-green-800 mb-3">Welcome to LibraryLane 📚</h1>
        <ul className="text-gray-600 space-y-1">
          <li>📖 Browse available books and read what they're about</li>
          <li>🏠 Take a book home and hand it back in when you're done</li>
          <li>➕ Want to donate a book? Search for it and add it to the library</li>
        </ul>
      </div>

      {loading && <p className="text-gray-500 text-center mt-10">Loading books...</p>} {/* && conditional render — only shows while loading is true */}

      {!loading && (
        <> {/* Fragment — lets you return multiple elements without adding a wrapping div to the DOM */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Available Books</h2>
            <span className="text-sm text-gray-400">{books.length} {books.length === 1 ? 'book' : 'books'}</span> {/* ternary — singular vs plural */}
          </div>

          {books.length === 0 ? ( // ternary — empty state message or the book grid
            <div className="text-center py-10 text-gray-400">
              <p>No books available right now.</p>
              <Link to="/search" className="text-green-700 underline mt-2 inline-block">Add the first one</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
              {books.map((book, i) => (
                <Link
                  key={bookIds[i]} // key prop — unique identifier so React can track each list item; use the id not the index
                  to={`/book/${bookIds[i]}`}
                  className="border rounded-xl overflow-hidden hover:shadow-md hover:border-green-400 transition"
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
          )}

          {takenBooks.length > 0 && ( // && conditional render — only shows the My Books section if there are taken books
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
