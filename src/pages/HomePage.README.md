# HomePage.jsx — Main Page

## Language

JavaScript (ES6+) with JSX syntax. Uses React hooks (`useState`, `useEffect`) and the Open Library API.

## What This Page Does

1. Reads the list of book IDs from Context (`bookIds` and `takenIds`)
2. Fetches full book details from the Open Library API for every ID
3. Displays two sections:
   - **"Available Books"** — books currently in the library (clickable cards in a responsive grid)
   - **"My Books"** — books the user has taken home (only shown if there are any)
4. Shows a loading message while fetching, and an empty state if there are no books

## Detailed Breakdown

### Reading from Context

```jsx
const { bookIds, takenIds } = useBooks()
```
Object destructuring — pulls `bookIds` and `takenIds` from the context value. This is equivalent to:
```jsx
const ctx = useBooks()
const bookIds = ctx.bookIds
const takenIds = ctx.takenIds
```

### Local State

```jsx
const [books, setBooks] = useState([])
const [takenBooks, setTakenBooks] = useState([])
const [loading, setLoading] = useState(true)
```

These are **local** to this component (not shared via Context) because no other component needs the fetched book details — only HomePage displays them.

- `books` — array of fetched book objects for available books
- `takenBooks` — array of fetched book objects for taken books
- `loading` — starts as `true`, set to `false` when fetching completes

`useState` returns a 2-element array: `[currentValue, setterFunction]`. We use array destructuring to name them.

### useEffect — Data Fetching

```jsx
useEffect(() => {
  async function fetchAll() { ... }
  fetchAll()
}, [bookIds, takenIds])
```

**What is `useEffect`?**
A React hook that runs code AFTER the component renders. It's used for "side effects" — things like API calls, timers, or DOM manipulation that aren't part of rendering JSX.

**Why not just fetch data at the top of the function?**
React components should be "pure" during rendering — same input, same output. API calls are unpredictable (network delays, errors) and shouldn't happen during rendering. `useEffect` separates them.

**The dependency array `[bookIds, takenIds]`:**
- `[]` empty → run only once when the component first appears (mounts)
- `[bookIds, takenIds]` → run once on mount AND again whenever either value changes
- No array at all → run after every single render (usually a mistake)

When the user adds a book on the SearchPage, `bookIds` updates in Context, which triggers this effect to re-run and fetch the new book's data.

**Why define `async function fetchAll()` inside?**
`useEffect` callbacks cannot be `async` directly (React expects them to return either nothing or a cleanup function, not a Promise). So we define an async function inside and call it immediately.

### The fetchBook Helper

```jsx
const fetchBook = async id => {
  const book = await fetch(`https://openlibrary.org/works/${id}.json`).then(res => res.json())
  let authorName = 'Unknown author'
  if (book.authors && book.authors[0]) {
    const authorData = await fetch(`https://openlibrary.org${book.authors[0].author.key}.json`).then(res => res.json())
    authorName = authorData.name
  }
  return { ...book, authorName }
}
```

**Two API calls per book:**
1. Fetch the work (book) data from `/works/{id}.json` → returns `{ title, covers, authors, description, ... }`
2. Fetch the author's name from `/authors/{key}.json` → returns `{ name, bio, ... }`

**Why two calls?** Open Library stores books and authors separately. The book endpoint only gives you the author's KEY (like `/authors/OL23919A`), not their name.

**`fetch(url).then(res => res.json())`:**
- `fetch()` returns a Response object
- `.json()` parses the response body as JSON and returns a JavaScript object
- This is a standard pattern you'll see in virtually every fetch call

**`book.authors && book.authors[0]`:**
- The `&&` short-circuits: if `book.authors` is `undefined` or `null`, the right side never evaluates
- This prevents a crash when a book has no author data

**`{ ...book, authorName }`:**
- Spread syntax: creates a new object with all properties from `book` plus our `authorName`
- `authorName` is shorthand for `authorName: authorName` (ES6 shorthand property names)

### Promise.all — Parallel Fetching

```jsx
const [libraryResults, takenResults] = await Promise.all([
  Promise.all(bookIds.map(fetchBook)),
  Promise.all(takenIds.map(fetchBook)),
])
```

**Inner `Promise.all(bookIds.map(fetchBook))`:**
- `.map(fetchBook)` transforms each ID into a Promise (the async fetch call)
- `Promise.all` waits for ALL of those promises to resolve
- This is much faster than fetching one-by-one because all requests go out simultaneously

**Outer `Promise.all([..., ...])`:**
- Fetches library books and taken books at the same time (in parallel)
- Array destructuring `[libraryResults, takenResults]` assigns names to each result

### try/catch

```jsx
try { ... } catch (err) {
  console.error('Failed to fetch books:', err)
}
setLoading(false)
```
- If any API call fails, the error is caught and logged (instead of crashing the app)
- `setLoading(false)` is outside the try/catch so it runs either way

### JSX — Conditional Rendering

**Pattern 1: `&&` (render or nothing)**
```jsx
{loading && <p>Loading books...</p>}
```
If `loading` is `true`, render the paragraph. If `false`, render nothing. This is the standard JSX pattern for "show this if condition is true."

**Pattern 2: Ternary (render one thing OR another)**
```jsx
{books.length === 0 ? (
  <div>No books available</div>
) : (
  <div>Grid of books</div>
)}
```
If the array is empty, show the empty state. Otherwise, show the book grid.

**Pattern 3: Fragment `<> </>`**
```jsx
{!loading && (
  <>
    <h2>Available Books</h2>
    <div>...</div>
  </>
)}
```
A React Fragment lets you return multiple elements without adding an extra `<div>` to the DOM. React requires components to return a single root element — Fragments provide that wrapper invisibly.

### Rendering a List with .map()

```jsx
{books.map((book, i) => (
  <Link key={bookIds[i]} to={`/book/${bookIds[i]}`}>
    ...
  </Link>
))}
```

- `.map()` transforms each book object into a JSX element
- `key={bookIds[i]}` — React requires a unique `key` on each list item. Keys help React's reconciliation algorithm figure out which items changed, were added, or removed. This makes DOM updates efficient.
- The `i` parameter is the array index — we use it to look up the corresponding ID from `bookIds`

### Responsive Grid

```jsx
className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
```

Tailwind's responsive design is **mobile-first**:
- `grid-cols-1` — 1 column (base/mobile, applies to all screens)
- `sm:grid-cols-2` — 2 columns on screens >= 640px (tablet)
- `lg:grid-cols-3` — 3 columns on screens >= 1024px (desktop)

The `sm:` and `lg:` prefixes are breakpoints — they override the base value at larger screen sizes.

### Book Cover Image

```jsx
{book.covers && book.covers[0] ? (
  <img src={`https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`} />
) : (
  <div>📖</div>
)}
```
- Checks if the book has cover data. If yes, show the image from Open Library's Covers API
- `-M` means medium size (other options: `-S` for small, `-L` for large)
- If no cover, show a placeholder div with a book emoji

## Symbols Used

| Symbol | Where | Meaning |
|---|---|---|
| `{ bookIds, takenIds }` | useBooks() | Object destructuring — extracts named properties |
| `[books, setBooks]` | useState | Array destructuring — names the two items returned by useState |
| `() => { }` | useEffect callback | Arrow function passed to useEffect |
| `async / await` | fetchAll, fetchBook | Makes asynchronous code read like synchronous code |
| `.then(res => res.json())` | fetch chain | Chains a callback onto a Promise — parses JSON response |
| `&&` in JSX | Conditional render | Short-circuit: "if left is true, render right" |
| `? :` in JSX | Ternary render | "If condition, render A, otherwise render B" |
| `<> </>` | Fragment | Invisible wrapper — groups elements without adding a DOM node |
| `` ` ` `` with `${}` | Template literals | String with embedded expressions (URL construction) |
| `...book` | Spread | Copies all properties of `book` into a new object |
| `.map()` | Array method | Transforms each element, returns a new array |
| `key={...}` | List rendering | Unique identifier for React's reconciliation algorithm |
