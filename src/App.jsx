import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import DetailPage from './pages/DetailPage'
import SearchPage from './pages/SearchPage'

function App() {
  return (
    // BrowserRouter enables client-side routing (URL changes without page reload)
    <BrowserRouter>
      {/* Navbar is outside <Routes> so it shows on every page */}
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* :id is a dynamic URL parameter — DetailPage reads it with useParams() */}
          <Route path="/book/:id" element={<DetailPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
