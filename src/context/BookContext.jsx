import { createContext, useContext, useState } from 'react'

const BookContext = createContext()

export function useBooks() {
  return useContext(BookContext)
}

export function BookProvider({ children }) {
  const [bookIds, setBookIds] = useState(() => {
    const saved = localStorage.getItem('bookIds')
    const defaults = ['OL82563W', 'OL45804W', 'OL102749W', 'OL893415W', 'OL261994W', 'OL59706W']
    return saved ? JSON.parse(saved) : defaults
  })

  const [takenIds, setTakenIds] = useState(() => {
    const saved = localStorage.getItem('takenIds')
    return saved ? JSON.parse(saved) : []
  })

  function addBook(id) {
    if (bookIds.includes(id)) return
    const updated = [...bookIds, id]
    setBookIds(updated)
    localStorage.setItem('bookIds', JSON.stringify(updated))

    const updatedTaken = takenIds.filter(t => t !== id)
    setTakenIds(updatedTaken)
    localStorage.setItem('takenIds', JSON.stringify(updatedTaken))
  }

  function removeBook(id) {
    const updated = bookIds.filter(bookId => bookId !== id)
    setBookIds(updated)
    localStorage.setItem('bookIds', JSON.stringify(updated))

    const updatedTaken = [...takenIds, id]
    setTakenIds(updatedTaken)
    localStorage.setItem('takenIds', JSON.stringify(updatedTaken))
  }

  return (
    <BookContext.Provider value={{ bookIds, takenIds, addBook, removeBook }}>
      {children}
    </BookContext.Provider>
  )
}
