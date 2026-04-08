// ============================================================
// BookContext.jsx — GLOBAL STATE MANAGEMENT WITH REACT CONTEXT
// ============================================================
//
// THE PROBLEM THIS SOLVES:
//   Multiple pages need access to the same data:
//     - HomePage needs the list of book IDs to display them
//     - SearchPage needs bookIds to know if a book is already added
//     - DetailPage needs bookIds AND takenIds to show the right button
//
//   Without Context, you'd have to store this state in App.jsx and pass
//   it down as props through every level: App → Page → Component.
//   This is called "prop drilling" and gets messy fast.
//
//   React Context solves this by creating a "global store" that any
//   component can tap into directly, no matter how deep it is in the tree.
//
// HOW REACT CONTEXT WORKS (3 steps):
//   1. CREATE the context:   const BookContext = createContext()
//   2. PROVIDE the context:  <BookContext.Provider value={...}>
//      — Wrap the part of the component tree that needs access
//      — The "value" is the data you're sharing
//   3. CONSUME the context:  useContext(BookContext)
//      — Any child component calls this to read the shared data
//      — We wrap it in a custom hook (useBooks) for convenience
//
// WHAT DATA IS SHARED:
//   - bookIds:    array of Open Library work IDs currently in the library
//   - takenIds:   array of work IDs the user has "taken home"
//   - addBook():  function to add a book to the library
//   - removeBook(): function to take a book out (move to "taken" list)
//
// PERSISTENCE WITH localStorage:
//   Both bookIds and takenIds are saved to localStorage (the browser's
//   built-in key-value storage). This means the data survives page
//   refreshes and browser restarts. Without localStorage, all state
//   would reset every time you reload the page because React state
//   only lives in memory.
// ============================================================

import { createContext, useContext, useState } from 'react'

// Step 1: CREATE the context object.
// This creates a "channel" that Provider and Consumer will communicate through.
// The value passed to createContext() is the DEFAULT value, used only if a
// component tries to consume the context without a Provider above it.
// We pass nothing (undefined) because we always wrap with BookProvider.
const BookContext = createContext()

// CUSTOM HOOK: useBooks()
// Instead of making every component write `useContext(BookContext)`,
// we export this shorthand. It also makes it easy to find all places
// that use book data by searching for "useBooks".
//
// WHY A CUSTOM HOOK?
//   - Cleaner syntax: useBooks() vs useContext(BookContext)
//   - Encapsulation: consumers don't need to import BookContext directly
//   - If we ever add validation (e.g., throw an error if used outside
//     a Provider), we only change it in one place
export function useBooks() {
  return useContext(BookContext)
}

// Step 2: PROVIDER COMPONENT
// This component wraps the app (in main.jsx) and makes the book data
// available to every component inside it via the Context.
//
// The { children } parameter is a React pattern — it means "whatever
// JSX is placed between <BookProvider> and </BookProvider>" will be
// rendered inside this component. In our case, that's <App />.
export function BookProvider({ children }) {

  // ---- STATE: bookIds (books currently in the library) ----
  //
  // useState() with a FUNCTION argument (called "lazy initialisation"):
  //   useState(() => { ... })
  //   The function only runs on the FIRST render, not on every re-render.
  //   This is important because reading from localStorage is relatively
  //   slow — we don't want to do it on every state update.
  //
  // WHAT IT DOES:
  //   1. Check if there's saved data in localStorage under the key 'bookIds'
  //   2. If yes: parse the JSON string back into an array and use that
  //   3. If no (first-time user): use a hardcoded array of default book IDs
  //      These are Open Library work IDs for classic books like
  //      The Great Gatsby, Pride and Prejudice, etc.
  const [bookIds, setBookIds] = useState(() => {
    const saved = localStorage.getItem('bookIds')
    const defaults = ['OL82563W', 'OL45804W', 'OL102749W', 'OL893415W', 'OL261994W', 'OL59706W']
    return saved ? JSON.parse(saved) : defaults
  })

  // ---- STATE: takenIds (books the user has "taken home") ----
  //
  // Same lazy initialisation pattern as above.
  // Starts as an empty array if nothing is saved.
  const [takenIds, setTakenIds] = useState(() => {
    const saved = localStorage.getItem('takenIds')
    return saved ? JSON.parse(saved) : []
  })

  // ---- FUNCTION: addBook(id) ----
  // Adds a book ID to the library. Used in two scenarios:
  //   1. Donating a new book via the search page (SearchPage.jsx)
  //   2. Handing a taken book back in (DetailPage.jsx)
  //
  // WHY THE DUPLICATE CHECK?
  //   `if (bookIds.includes(id)) return` prevents the same book from
  //   appearing twice in the library. This is a guard clause — it exits
  //   the function early if the condition is met.
  //
  // WHY SPREAD SYNTAX [...bookIds, id]?
  //   React state must be treated as IMMUTABLE. You cannot do
  //   `bookIds.push(id)` because React won't detect the change
  //   (it's the same array reference). Instead, we create a NEW array
  //   with all existing items plus the new one. This triggers a re-render.
  //
  // WHY localStorage.setItem() AFTER setState?
  //   We sync the state to localStorage manually so it persists.
  //   React's useState does NOT automatically save to localStorage.
  function addBook(id) {
    if (bookIds.includes(id)) return
    const updated = [...bookIds, id]
    setBookIds(updated)
    localStorage.setItem('bookIds', JSON.stringify(updated))

    // If this book was previously taken, remove it from the taken list.
    // This handles the "hand back in" scenario — the book moves from
    // takenIds back to bookIds.
    // .filter() creates a new array with only the items that pass the test.
    // Here it keeps every ID that is NOT equal to the one being returned.
    const updatedTaken = takenIds.filter(t => t !== id)
    setTakenIds(updatedTaken)
    localStorage.setItem('takenIds', JSON.stringify(updatedTaken))
  }

  // ---- FUNCTION: removeBook(id) ----
  // Takes a book out of the library (moves it to the "taken" list).
  // Called from DetailPage.jsx when the user clicks "Take this book".
  //
  // This is the opposite of addBook:
  //   1. Remove the ID from bookIds (filter it out)
  //   2. Add the ID to takenIds (spread + append)
  //   3. Sync both changes to localStorage
  function removeBook(id) {
    const updated = bookIds.filter(bookId => bookId !== id)
    setBookIds(updated)
    localStorage.setItem('bookIds', JSON.stringify(updated))

    const updatedTaken = [...takenIds, id]
    setTakenIds(updatedTaken)
    localStorage.setItem('takenIds', JSON.stringify(updatedTaken))
  }

  // Step 2 (continued): RENDER THE PROVIDER
  //
  // <BookContext.Provider value={...}>
  //   The "value" prop is the data that ALL consumers (useBooks()) will receive.
  //   We pass an object with four things:
  //     - bookIds:    the current array of library book IDs (read-only data)
  //     - takenIds:   the current array of taken book IDs (read-only data)
  //     - addBook:    function to add a book (lets consumers modify state)
  //     - removeBook: function to remove a book (lets consumers modify state)
  //
  //   IMPORTANT: whenever any of these values change, every component that
  //   calls useBooks() will automatically re-render with the new data.
  //   This is how Context keeps the UI in sync with the state.
  //
  // {children} renders whatever was placed inside <BookProvider>...</BookProvider>
  // In our case (from main.jsx), that's <App />.
  return (
    <BookContext.Provider value={{ bookIds, takenIds, addBook, removeBook }}>
      {children}
    </BookContext.Provider>
  )
}
