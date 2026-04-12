# LibraryLane — Test Notes

Quick reference for the hardest concepts in this project.

---

## 1. React Context — the 3-step pattern

Always in this order:

```jsx
// 1. CREATE
const BookContext = createContext()

// 2. PROVIDE (wrap App in main.jsx)
<BookContext.Provider value={{ bookIds, takenIds, addBook, removeBook }}>
  {children}
</BookContext.Provider>

// 3. CONSUME (in any child component)
const { bookIds, addBook } = useContext(BookContext)
// or via our custom hook:
const { bookIds, addBook } = useBooks()
```

**Why Context?** Avoids prop drilling — instead of passing data through every component level, any component can access it directly.

---

## 2. useState — lazy initialisation

When the initial value is expensive to compute (e.g. reading localStorage), pass a **function** instead of a value:

```jsx
// SLOW — runs on every re-render
const [bookIds, setBookIds] = useState(JSON.parse(localStorage.getItem('bookIds')))

// CORRECT — runs only on first render
const [bookIds, setBookIds] = useState(() => {
  const saved = localStorage.getItem('bookIds')
  return saved ? JSON.parse(saved) : ['OL82563W', 'OL45804W']
})
```

---

## 3. Immutable state updates (spread syntax)

React won't detect changes to the same array reference. Always create a **new** array:

```jsx
// WRONG — React won't re-render
bookIds.push(id)
setBookIds(bookIds)

// CORRECT — new array reference triggers re-render
const updated = [...bookIds, id]
setBookIds(updated)
```

Same for removing: use `.filter()` to return a new array.

---

## 4. useEffect — the rules

```jsx
useEffect(() => {
  // runs AFTER render

  async function fetchAll() { ... }
  fetchAll() // define then call — can't make the callback itself async

}, [bookIds, takenIds]) // re-run whenever these change
//  []                  → run once on mount only
//  [bookIds]           → run when bookIds changes
//  (no array)          → run after EVERY render (almost always wrong)
```

---

## 5. Promise.all — parallel fetching

Fetching one-by-one is slow. `Promise.all` fires all requests at the same time:

```jsx
// Sequential (slow)
for (const id of bookIds) {
  const book = await fetchBook(id)
}

// Parallel (fast) — map creates an array of promises, Promise.all waits for all
const books = await Promise.all(bookIds.map(fetchBook))

// Two parallel groups at once
const [libraryResults, takenResults] = await Promise.all([
  Promise.all(bookIds.map(fetchBook)),
  Promise.all(takenIds.map(fetchBook)),
])
```

---

## 6. Chained ternary (DetailPage button logic)

```jsx
// if (isInLibrary) → "Take this book"
// else if (isTaken) → "Hand back in"
// else → "Add to library"

{isInLibrary ? (
  <button onClick={handleTake}>Take this book</button>
) : isTaken ? (
  <button onClick={handleAdd}>Hand back in</button>
) : (
  <button onClick={handleAdd}>Add to library</button>
)}
```

---

## 7. Controlled components (forms)

React owns the input value — not the DOM:

```jsx
const [query, setQuery] = useState('')

<form onSubmit={handleSearch}>
  <input
    value={query}                         // React controls the value
    onChange={e => setQuery(e.target.value)} // update state on every keystroke
  />
</form>

async function handleSearch(e) {
  e.preventDefault()  // stops the browser from reloading the page
  if (!query.trim()) return  // guard: skip empty searches
  // ... fetch
}
```

---

## 8. useParams + useNavigate (React Router)

```jsx
// Route defined in App.jsx:  <Route path="/book/:id" element={<DetailPage />} />

const { id } = useParams()     // reads ":id" from the URL → "OL82563W"
const navigate = useNavigate() // function to change the URL

navigate('/')    // go to homepage
navigate(-1)     // go back (like browser back button)
```

---

## 9. The Open Library API — two calls per book

The book endpoint only gives you an author **key**, not a name. You always need two requests:

```
1. https://openlibrary.org/works/{id}.json
   → gives: title, covers, description, authors[0].author.key

2. https://openlibrary.org{authors[0].author.key}.json
   → gives: name
```

Description can be a string OR an object — always handle both:
```jsx
const description = typeof book.description === 'object'
  ? book.description.value
  : book.description
```

---

## 10. Key props in lists

React needs a unique `key` on every list item so it can update the DOM efficiently:

```jsx
{books.map((book, i) => (
  <Link key={bookIds[i]} to={`/book/${bookIds[i]}`}>  // use the ID, not index i
    ...
  </Link>
))}
```

Using the array index as a key causes bugs when the list order changes.
