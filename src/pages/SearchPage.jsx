import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBooks } from '../context/BookContext'

function SearchPage() {
  const { bookIds, addBook } = useBooks()

  // useState — creates a variable React watches. when it changes, the page re-renders
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // async — marks a function so you can use await inside it
  async function handleSearch(e) {
    e.preventDefault()        // e.preventDefault — stops the browser reloading the page on form submit
    if (!query.trim()) return // guard clause — .trim() removes whitespace, exits if input is empty

    setLoading(true)
    // fetch() — sends a request to the URL and returns a Promise
    // await — pauses here until the response comes back
    // encodeURIComponent — converts the search text into a URL-safe string e.g. "harry potter" → "harry%20potter"
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`)
    const data = await res.json() // .json() — parses the response body as JSON
    setResults(data.docs) // .docs — the Open Library search API wraps results in a "docs" array
    setLoading(false)
  }

  function handleAdd(book) {
    const id = book.key.replace('/works/', '') // .replace() — the API returns "/works/OL82563W", this strips it to just "OL82563W"
    addBook(id)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add a Book</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        {/* controlled component — value={query} ties the input to state, onChange keeps them in sync on every keystroke */}
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
          const alreadyAdded = bookIds.includes(id) // .includes() — checks if this book id is already in the library

          return (
            <li key={id} className="border rounded-lg p-4 flex justify-between items-center gap-4">
              <Link to={`/book/${id}`} className="flex-1 hover:underline">
                <p className="font-semibold">{book.title}</p>
                {/* author_name is an array from the API — [0] gets just the first author */}
                <p className="text-sm text-gray-500">{book.author_name ? book.author_name[0] : 'Unknown author'}</p>
              </Link>
              <button
                onClick={() => handleAdd(book)}
                disabled={alreadyAdded} // disabled attribute — prevents clicking and triggers the disabled: Tailwind styles
                className="text-sm px-3 py-1 rounded-lg border border-green-700 text-green-700 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
              >
                {alreadyAdded ? 'Added' : 'Add'} {/* ternary — changes button text based on whether it's already added */}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default SearchPage
