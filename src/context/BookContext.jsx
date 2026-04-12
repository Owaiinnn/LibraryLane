import { createContext, useContext, useState } from 'react'

// Step 1 — CREATE the context (the "channel" data flows through)
const BookContext = createContext()

// Custom hook so other components just call useBooks() instead of useContext(BookContext)
export function useBooks() {
  return useContext(BookContext) // Step 3 — CONSUME
}

// Step 2 — PROVIDE: wraps the whole app (in main.jsx) so every component can access the data
export function BookProvider({ children }) {

  // Lazy initialisation: pass a FUNCTION to useState so localStorage is only read once (on mount),
  // not on every re-render. Without the arrow function it would run every render.
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
    if (bookIds.includes(id)) return // guard: don't add duplicates
    // Spread [...bookIds, id] creates a NEW array — React won't detect a change if you push() to the same array
    const updated = [...bookIds, id]
    setBookIds(updated)
    localStorage.setItem('bookIds', JSON.stringify(updated)) // manually sync to localStorage

    // if handing back in, remove from taken list
    const updatedTaken = takenIds.filter(t => t !== id) // .filter() also returns a new array
    setTakenIds(updatedTaken)
    localStorage.setItem('takenIds', JSON.stringify(updatedTaken))
  }

  function removeBook(id) {
    const updated = bookIds.filter(bookId => bookId !== id)
    setBookIds(updated)
    localStorage.setItem('bookIds', JSON.stringify(updated))

    // add to taken list
    const updatedTaken = [...takenIds, id]
    setTakenIds(updatedTaken)
    localStorage.setItem('takenIds', JSON.stringify(updatedTaken))
  }

  // value = the data every consumer gets. Whenever any of these change, consumers re-render.
  return (
    <BookContext.Provider value={{ bookIds, takenIds, addBook, removeBook }}>
      {children}
    </BookContext.Provider>
  )
}
