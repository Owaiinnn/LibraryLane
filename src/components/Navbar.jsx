import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-green-700 text-white px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold tracking-tight">
        LibraryLane
      </Link>
      <div className="flex gap-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/search" className="hover:underline">Add Book</Link>
      </div>
    </nav>
  )
}

export default Navbar
