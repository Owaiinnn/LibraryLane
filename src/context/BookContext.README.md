# BookContext.jsx — Global State Management

## Language

JavaScript (ES6+) with JSX syntax. Uses React's built-in Context API.

## What This File Does

This is the most important file for understanding how data flows through the app. It creates a **global store** of book data that any component can access, no matter where it sits in the component tree.

It manages two pieces of state:
- **`bookIds`** — array of Open Library work IDs for books currently in the library
- **`takenIds`** — array of work IDs the user has "taken home"

And exposes two functions:
- **`addBook(id)`** — adds a book to the library (or hands a taken book back in)
- **`removeBook(id)`** — takes a book out of the library (moves it to "taken")

## The Problem This Solves

Multiple pages need the same data:
- `HomePage` needs `bookIds` and `takenIds` to display books
- `SearchPage` needs `bookIds` to know if a search result is already added
- `DetailPage` needs both arrays plus `addBook` and `removeBook`

Without Context, you'd have to store state in `App.jsx` and pass it down through every component as props. This is called **"prop drilling"** — and it gets messy fast, especially as the app grows.

React Context lets any component tap into the shared data directly.

## How React Context Works (3 Steps)

### Step 1: Create the Context

```jsx
const BookContext = createContext()
```
This creates a "channel" for communication. Think of it like creating a radio frequency — you've set it up, but nobody is broadcasting or listening yet.

The value passed to `createContext()` would be the default value, used only if a component tries to consume the context without a Provider above it in the tree. We pass nothing (undefined) because we always wrap with `BookProvider`.

### Step 2: Provide the Context

```jsx
<BookContext.Provider value={{ bookIds, takenIds, addBook, removeBook }}>
  {children}
</BookContext.Provider>
```
The Provider is like a radio transmitter — it broadcasts the `value` to all components nested inside it. In `main.jsx`, `BookProvider` wraps the entire `<App />`, so every component in the app can receive this data.

The `value` prop is the actual data being shared. Whenever this value changes, every component that consumes the context automatically re-renders.

### Step 3: Consume the Context

```jsx
export function useBooks() {
  return useContext(BookContext)
}
```
This custom hook is the "radio receiver." Any component that calls `useBooks()` gets the current value from the nearest Provider above it.

**Why wrap it in a custom hook?**
- Cleaner: `useBooks()` instead of `useContext(BookContext)`
- Encapsulation: consuming components don't need to import `BookContext` directly
- Single place to add validation later (e.g., throw an error if used outside a Provider)

## Detailed Breakdown

### Lazy State Initialisation

```jsx
const [bookIds, setBookIds] = useState(() => {
  const saved = localStorage.getItem('bookIds')
  const defaults = ['OL82563W', 'OL45804W', ...]
  return saved ? JSON.parse(saved) : defaults
})
```

**What is `useState(() => { ... })`?**
When you pass a FUNCTION to `useState` (instead of a direct value), React only calls that function on the very first render. This is called **lazy initialisation**.

**Why lazy?** Reading from `localStorage` is relatively slow. If we wrote `useState(localStorage.getItem(...))`, it would read from localStorage on every re-render (the value would be thrown away on subsequent renders, but the work would still be done). The function form avoids this wasted work.

**What is `localStorage`?**
- The browser's built-in key-value storage
- Data persists across page refreshes and browser restarts
- Stores only strings — that's why we use `JSON.stringify()` to save and `JSON.parse()` to load
- Each origin (domain) gets its own isolated storage

**The ternary:** `saved ? JSON.parse(saved) : defaults`
- If `saved` is not null (user has used the app before) → parse the saved JSON string back into an array
- If `saved` is null (first-time user) → use the hardcoded default book IDs

### addBook Function

```jsx
function addBook(id) {
  if (bookIds.includes(id)) return          // guard clause
  const updated = [...bookIds, id]           // create new array
  setBookIds(updated)                        // update React state
  localStorage.setItem('bookIds', JSON.stringify(updated))  // persist

  const updatedTaken = takenIds.filter(t => t !== id)  // remove from taken
  setTakenIds(updatedTaken)
  localStorage.setItem('takenIds', JSON.stringify(updatedTaken))
}
```

**`if (bookIds.includes(id)) return`** — a guard clause. If the book is already in the library, exit the function immediately. This prevents duplicates.

**`[...bookIds, id]`** — the spread operator. Creates a brand new array containing all existing items plus the new ID at the end. Why not `bookIds.push(id)`? Because React state is **immutable**. If you mutate the existing array, React won't detect the change (it compares by reference, and the reference hasn't changed). Creating a new array gives React a new reference, which triggers a re-render.

**`takenIds.filter(t => t !== id)`** — creates a new array with every item EXCEPT the one being added back. `.filter()` keeps items where the callback returns `true`. `t !== id` returns true for all IDs that are NOT the one we're returning, effectively removing it from the taken list.

### removeBook Function

```jsx
function removeBook(id) {
  const updated = bookIds.filter(bookId => bookId !== id)
  setBookIds(updated)
  localStorage.setItem('bookIds', JSON.stringify(updated))

  const updatedTaken = [...takenIds, id]
  setTakenIds(updatedTaken)
  localStorage.setItem('takenIds', JSON.stringify(updatedTaken))
}
```

The opposite of `addBook`:
1. Filter the book OUT of `bookIds`
2. Spread the book INTO `takenIds`
3. Sync both to localStorage

### The Provider Return

```jsx
return (
  <BookContext.Provider value={{ bookIds, takenIds, addBook, removeBook }}>
    {children}
  </BookContext.Provider>
)
```

**`{children}`** is a special React prop. It represents whatever JSX is placed between the opening and closing tags. In `main.jsx`:
```jsx
<BookProvider>
  <App />        ← this is "children"
</BookProvider>
```

**`value={{ bookIds, takenIds, addBook, removeBook }}`** — the double curly braces are NOT special syntax. The outer `{}` means "JavaScript expression in JSX." The inner `{}` is a regular JavaScript object literal. So it's passing an object with four properties.

## Symbols Used

| Symbol | Where | Meaning |
|---|---|---|
| `() => { ... }` | useState init | Arrow function — used here for lazy initialisation |
| `[...bookIds, id]` | addBook | Spread into a new array — immutable state update |
| `.filter(t => t !== id)` | addBook/removeBook | Array method — creates new array keeping only items that pass the test |
| `.includes(id)` | addBook | Array method — returns true if the array contains the value |
| `? :` | useState init | Ternary — `saved ? JSON.parse(saved) : defaults` |
| `{{ }}` | Provider value | Outer = JSX expression, inner = JS object literal |
| `{ children }` | Function params | Destructures the `children` prop from the props object |
| `JSON.stringify()` | localStorage | Converts a JavaScript value to a JSON string |
| `JSON.parse()` | localStorage | Converts a JSON string back to a JavaScript value |
