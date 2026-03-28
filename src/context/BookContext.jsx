import { createContext, useContext, useState } from 'react'

const BookContext = createContext()

export function useBooks() {
  return useContext(BookContext)
}

export function BookProvider({ children }) {
  const [bookIds, setBookIds] = useState(() => {
    const saved = localStorage.getItem('bookIds')
    const defaults = ['OL82563W', 'OL45804W', 'OL102749W']
    return saved ? JSON.parse(saved) : defaults
  })

  function addBook(id) {
    if (bookIds.includes(id)) return
    const updated = [...bookIds, id]
    setBookIds(updated)
    localStorage.setItem('bookIds', JSON.stringify(updated))
  }

  function removeBook(id) {
    const updated = bookIds.filter(bookId => bookId !== id)
    setBookIds(updated)
    localStorage.setItem('bookIds', JSON.stringify(updated))
  }

  return (
    <BookContext.Provider value={{ bookIds, addBook, removeBook }}>
      {children}
    </BookContext.Provider>
  )
}
