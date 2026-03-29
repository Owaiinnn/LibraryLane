import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBooks } from '../context/BookContext'

function SearchPage() {
  const { bookIds, addBook } = useBooks()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`)
    const data = await res.json()
    setResults(data.docs)
    setLoading(false)
  }

  function handleAdd(book) {
    const id = book.key.replace('/works/', '')
    addBook(id)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add a Book</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for a book..."
          className="border rounded-lg px-4 py-2 flex-1 outline-none focus:ring-2 focus:ring-green-600"
        />
        <button
          type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-gray-500">Searching...</p>}

      <ul className="space-y-3">
        {results.map(book => {
          const id = book.key.replace('/works/', '')
          const alreadyAdded = bookIds.includes(id)

          return (
            <li key={id} className="border rounded-lg p-4 flex justify-between items-center gap-4">
              <Link to={`/book/${id}`} className="flex-1 hover:underline">
                <p className="font-semibold">{book.title}</p>
                <p className="text-sm text-gray-500">{book.author_name ? book.author_name[0] : 'Unknown author'}</p>
              </Link>
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
