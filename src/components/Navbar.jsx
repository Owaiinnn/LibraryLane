import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()

  return (
    <nav className="bg-green-700 text-white px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold tracking-tight">
        LibraryLane
      </Link>
      <div className="flex gap-6">
        <Link
          to="/"
          className={`text-sm font-medium hover:underline ${location.pathname === '/' ? 'underline' : ''}`}
        >
          Home
        </Link>
        <Link
          to="/search"
          className={`text-sm font-medium hover:underline ${location.pathname === '/search' ? 'underline' : ''}`}
        >
          Add Book
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
