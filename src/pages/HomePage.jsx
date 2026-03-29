import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBooks } from '../context/BookContext'

function HomePage() {
  const { bookIds } = useBooks()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (bookIds.length === 0) {
      setLoading(false)
      return
    }

    async function fetchBooks() {
      try {
        const results = await Promise.all(
          bookIds.map(async id => {
            const book = await fetch(`https://openlibrary.org/works/${id}.json`).then(res => res.json())

            let authorName = 'Unknown author'
            if (book.authors && book.authors[0]) {
              const authorData = await fetch(`https://openlibrary.org${book.authors[0].author.key}.json`).then(res => res.json())
              authorName = authorData.name
            }

            return { ...book, authorName }
          })
        )
        setBooks(results)
      } catch (err) {
        console.error('Failed to fetch books:', err)
      }
      setLoading(false)
    }

    fetchBooks()
  }, [bookIds])

  return (
    <div>
      <div className="bg-green-50 border border-green-100 rounded-xl p-6 mb-8">
        <h1 className="text-2xl font-bold text-green-800 mb-2">Welcome to LibraryLane 📚</h1>
        <p className="text-gray-600">
          A digital street library where you can discover and exchange books with others.
          Browse what's available, take a book home, or add one you'd like to share.
        </p>
      </div>

      {loading && <p className="text-gray-500 text-center mt-10">Loading books...</p>}

      {!loading && books.length === 0 && (
        <div className="text-center mt-16">
          <p className="text-gray-400 text-lg">No books available right now.</p>
          <Link to="/search" className="text-green-700 underline mt-2 inline-block">Add the first one</Link>
        </div>
      )}

      {!loading && books.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Available Books</h2>
            <span className="text-sm text-gray-400">{books.length} {books.length === 1 ? 'book' : 'books'}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book, i) => (
              <Link
                key={bookIds[i]}
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
        </>
      )}
    </div>
  )
}

export default HomePage
