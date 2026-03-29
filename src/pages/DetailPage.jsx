import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBooks } from '../context/BookContext'

function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { bookIds, takenIds, addBook, removeBook } = useBooks()
  const [book, setBook] = useState(null)
  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)

  const isInLibrary = bookIds.includes(id)
  const isTaken = takenIds.includes(id)

  useEffect(() => {
    async function fetchBook() {
      try {
        const bookData = await fetch(`https://openlibrary.org/works/${id}.json`).then(res => res.json())
        setBook(bookData)

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

  function handleTake() {
    removeBook(id)
    navigate('/')
  }

  function handleAdd() {
    addBook(id)
    navigate('/')
  }

  if (loading) return <p className="text-gray-500 mt-10 text-center">Loading...</p>
  if (!book) return <p className="text-gray-500 mt-10 text-center">Book not found.</p>

  const description = typeof book.description === 'object' ? book.description.value : book.description
  const coverId = book.covers && book.covers[0]

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:underline mb-8 block">
        ← Back
      </button>

      <div className="flex gap-6 mb-8">
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
          {author && <p className="text-green-700 font-medium mb-2">{author.name}</p>}
          {book.first_publish_date && (
            <p className="text-sm text-gray-400">First published: {book.first_publish_date}</p>
          )}
        </div>
      </div>

      {description && (
        <p className="text-gray-600 leading-relaxed mb-8">{description}</p>
      )}

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
