import { createContext, useContext, useState } from 'react'

const BookContext = createContext() // createContext — creates the context object the whole app shares

// custom hook — a function that starts with "use" and wraps a React hook, just to make it easier to call
export function useBooks() {
  return useContext(BookContext) // useContext — lets this component read the value from BookContext
}

export function BookProvider({ children }) {

  // useState — creates a variable React watches. when it changes, the page re-renders
  // lazy initialisation — passing a function so localStorage is only read on first render, not every render
  const [bookIds, setBookIds] = useState(() => {
    const saved = localStorage.getItem('bookIds') // localStorage.getItem — reads saved data from the browser
    const defaults = ['OL82563W', 'OL45804W', 'OL102749W', 'OL893415W', 'OL261994W', 'OL59706W']
    return saved ? JSON.parse(saved) : defaults // ternary — use saved data if it exists, otherwise the defaults
  })

  const [takenIds, setTakenIds] = useState(() => {
    const saved = localStorage.getItem('takenIds')
    return saved ? JSON.parse(saved) : []
  })

  function addBook(id) {
    if (bookIds.includes(id)) return // guard clause — exits early if the book is already in the list
    const updated = [...bookIds, id] // spread syntax — creates a new array instead of mutating the existing one
    setBookIds(updated)
    localStorage.setItem('bookIds', JSON.stringify(updated)) // localStorage.setItem — saves the updated array to the browser

    const updatedTaken = takenIds.filter(t => t !== id) // .filter() — returns a new array without the given id
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
    // Provider — wraps children and makes the value available to every component inside
    <BookContext.Provider value={{ bookIds, takenIds, addBook, removeBook }}>
      {children}
    </BookContext.Provider>
  )
}
