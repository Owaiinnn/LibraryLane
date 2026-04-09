# SearchPage.jsx — Search & Add Books

## Language

JavaScript (ES6+) with JSX syntax. Uses React hooks and the Open Library Search API.

## What This Page Does

1. Provides a search form where the user types a book title
2. Sends the query to the Open Library Search API
3. Displays up to 10 results
4. Each result has an "Add" button to add the book to the library
5. If a book is already in the library, the button shows "Added" and is disabled

## Detailed Breakdown

### Reading from Context

```jsx
const { bookIds, addBook } = useBooks()
```
- `bookIds` — needed to check whether a search result is already in the library
- `addBook` — the function to add a book to the library

### Local State

```jsx
const [query, setQuery] = useState('')
const [results, setResults] = useState([])
const [loading, setLoading] = useState(false)
```
- `query` — the text in the search input. Starts as an empty string.
- `results` — the array of book objects from the API response. Starts empty.
- `loading` — starts `false` (unlike HomePage which starts `true`, because SearchPage doesn't fetch anything on mount — it waits for the user to submit)

### Form Handling — handleSearch

```jsx
async function handleSearch(e) {
  e.preventDefault()
  if (!query.trim()) return
  ...
}
```

**`e.preventDefault()`:**
By default, submitting an HTML `<form>` causes the browser to reload the page (it tries to send a GET or POST request to the server). `e.preventDefault()` stops this default behaviour so we can handle the submission entirely in JavaScript. This is essential in a SPA.

The `e` parameter is the **event object** — the browser passes it automatically to event handlers. It contains information about the event (which element triggered it, mouse position, etc.) and methods like `preventDefault()`.

**`if (!query.trim()) return`:**
- `.trim()` removes whitespace from both ends of the string
- `!` negates: if the trimmed string is empty (falsy), skip the search
- This is a guard clause — exits the function early if the input is blank

### The API Call

```jsx
const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`)
const data = await res.json()
setResults(data.docs)
```

**`encodeURIComponent(query)`:**
Converts special characters into URL-safe equivalents:
- `"Harry Potter"` → `"Harry%20Potter"` (spaces become `%20`)
- `"Pride & Prejudice"` → `"Pride%20%26%20Prejudice"` (& becomes `%26`)
Without this, special characters would break the URL structure.

**`&limit=10`:** A query parameter telling the API to return a maximum of 10 results. This keeps the response small and fast.

**The API response structure:**
```json
{
  "docs": [
    { "key": "/works/OL82563W", "title": "The Great Gatsby", "author_name": ["F. Scott Fitzgerald"], ... },
    ...
  ]
}
```
- `docs` is the array of matching books
- `key` has the format `/works/OLXXXXXW` — we'll need to strip the `/works/` prefix

### Adding a Book — handleAdd

```jsx
function handleAdd(book) {
  const id = book.key.replace('/works/', '')
  addBook(id)
}
```

- `.replace('/works/', '')` strips the prefix: `"/works/OL82563W"` → `"OL82563W"`
- `addBook(id)` from Context handles the rest (updating state and localStorage)
- After this, `bookIds` in Context now includes the new ID, which triggers a re-render of this component (the button will update to "Added")

### The Search Form (Controlled Component)

```jsx
<form onSubmit={handleSearch}>
  <input
    type="text"
    value={query}
    onChange={e => setQuery(e.target.value)}
  />
  <button type="submit">Search</button>
</form>
```

**What is a controlled component?**
The `<input>` value is controlled by React state (`value={query}`). Every keystroke:
1. Browser fires the `onChange` event
2. `e.target.value` is the new text in the input
3. `setQuery(e.target.value)` updates state
4. React re-renders the component
5. The input displays the new value from state

This means React is always the "source of truth" for what's in the input. The alternative is an "uncontrolled component" where the DOM manages the value and you read it with a ref.

**`type="submit"`** on the button means clicking it triggers the form's `onSubmit` event. Pressing Enter in the text input also triggers `onSubmit` — that's built-in browser behaviour for forms.

### Search Results List

```jsx
{results.map(book => {
  const id = book.key.replace('/works/', '')
  const alreadyAdded = bookIds.includes(id)
  return (
    <li key={id}>...</li>
  )
})}
```

For each search result:
1. Extract the clean ID from the API's key format
2. Check if it's already in the library using `.includes()`
3. Render a list item with the book info and an Add/Added button

### The Add Button

```jsx
<button
  onClick={() => handleAdd(book)}
  disabled={alreadyAdded}
>
  {alreadyAdded ? 'Added' : 'Add'}
</button>
```

**`disabled={alreadyAdded}`:**
- When `true`, the HTML `disabled` attribute is set
- The button can't be clicked and React won't fire the `onClick` handler
- Tailwind's `disabled:` prefix applies styles only when disabled:
  - `disabled:opacity-40` → makes the button faded/transparent
  - `disabled:cursor-not-allowed` → shows a "no" cursor on hover

**`{alreadyAdded ? 'Added' : 'Add'}`:**
- Ternary that changes the button text based on state

**`onClick={() => handleAdd(book)}`:**
- The arrow function is needed because we want to pass `book` as an argument
- If we wrote `onClick={handleAdd(book)}`, it would call `handleAdd` immediately during rendering (not on click) — wrapping it in `() =>` makes it a function that is called only when clicked

### Author Display

```jsx
{book.author_name ? book.author_name[0] : 'Unknown author'}
```
- The search API returns `author_name` as an array (a book can have multiple authors)
- We display only the first author: `[0]`
- If `author_name` is undefined (some books lack author data), show "Unknown author"

## Symbols Used

| Symbol | Where | Meaning |
|---|---|---|
| `e` | Event handlers | The event object — passed automatically by the browser |
| `e.preventDefault()` | handleSearch | Stops the browser's default form submission behaviour |
| `e.target.value` | onChange | The current value of the input element that triggered the event |
| `!query.trim()` | Guard clause | `!` negates, `.trim()` strips whitespace — checks if input is blank |
| `encodeURIComponent()` | URL | Escapes special characters for safe URL embedding |
| `.replace('a', 'b')` | handleAdd | String method — replaces first occurrence of 'a' with 'b' |
| `.includes(id)` | alreadyAdded | Array method — checks if the array contains the value |
| `() => handleAdd(book)` | onClick | Arrow function wrapper — delays execution until click |
| `disabled={...}` | Button | Boolean HTML attribute — prevents interaction when true |
| `? :` | Button text | Ternary — shows "Added" or "Add" based on state |
