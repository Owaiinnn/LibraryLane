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

  if (loading) return <p className="text-gray-500">Loading books...</p>

  if (books.length === 0) return <p className="text-gray-500">No books available right now.</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Available Books</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {books.map((book, i) => (
          <Link
            key={bookIds[i]}
            to={`/book/${bookIds[i]}`}
            className="border rounded-lg p-4 hover:shadow-md transition"
          >
            <h2 className="font-semibold text-lg">{book.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{book.authorName}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HomePage
