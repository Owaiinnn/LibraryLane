import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import DetailPage from './pages/DetailPage'
import SearchPage from './pages/SearchPage'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book/:id" element={<DetailPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
