import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBooks } from '../context/BookContext'

function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { removeBook } = useBooks()
  const [book, setBook] = useState(null)
  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) return <p className="text-gray-500">Loading...</p>
  if (!book) return <p className="text-gray-500">Book not found.</p>

  const description = typeof book.description === 'object' ? book.description.value : book.description

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:underline mb-6 block">
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-1">{book.title}</h1>
      {author && <p className="text-gray-500 mb-4">{author.name}</p>}

      {description && (
        <p className="text-gray-700 leading-relaxed mb-6">{description}</p>
      )}

      <div className="text-sm text-gray-400 mb-8">
        <p>OpenLibrary ID: {id}</p>
        {book.first_publish_date && <p>First published: {book.first_publish_date}</p>}
      </div>

      <button
        onClick={handleTake}
        className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition"
      >
        Take this book
      </button>
    </div>
  )
}

export default DetailPage
