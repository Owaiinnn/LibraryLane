# src/ — Application Source Code

## Language & Technologies

| Technology | What it is | Why it's used |
|---|---|---|
| **JavaScript (ES6+)** | The programming language. All `.jsx` files are JavaScript with JSX syntax mixed in. ES6+ means we use modern features like arrow functions, destructuring, template literals, and modules. |
| **JSX** | A syntax extension for JavaScript that lets you write HTML-like code inside JavaScript. For example `<div className="box">Hello</div>`. JSX is NOT valid JavaScript on its own — it gets compiled to regular function calls (`React.createElement(...)`) by a build tool (Vite + Babel). |
| **React 19** | A JavaScript library for building user interfaces. React lets you build UIs out of reusable "components" (functions that return JSX). It handles efficiently updating the DOM when your data changes. |
| **React Router DOM v7** | A library for client-side routing. In a Single Page Application (SPA), there's only one HTML page. React Router intercepts link clicks and swaps out components based on the URL — no full page reload needed. |
| **Tailwind CSS v4** | A utility-first CSS framework. Instead of writing custom CSS classes, you apply pre-built utility classes directly in your JSX (e.g., `className="text-xl font-bold mt-4"`). |
| **Vite** | The build tool and development server. It bundles all the JavaScript/CSS, compiles JSX, and serves the app during development with hot module replacement (changes appear instantly without a page reload). |

## File Structure

```
src/
├── main.jsx                  ← Entry point — boots React and mounts the app
├── App.jsx                   ← App shell — layout and route definitions
├── index.css                 ← Global styles and Tailwind import
├── context/
│   └── BookContext.jsx       ← Global state management (React Context)
├── components/
│   └── Navbar.jsx            ← Navigation bar shown on every page
└── pages/
    ├── HomePage.jsx          ← Main page — displays all books
    ├── SearchPage.jsx        ← Search Open Library API and add books
    └── DetailPage.jsx        ← Individual book detail view
```

## How the App Loads (step by step)

1. Browser loads `index.html` which has a `<div id="root">` and a `<script>` tag pointing to `main.jsx`
2. `main.jsx` finds the "root" div and tells React to render the component tree into it
3. The component tree is: `StrictMode` → `BookProvider` → `App`
4. `App` sets up the router and renders the `Navbar` plus whichever page matches the URL
5. Pages read shared data from `BookContext` and fetch book details from the Open Library API

## Symbols & Syntax Used Across the Project

### JavaScript Operators

| Symbol | Name | Example in this project | What it means |
|---|---|---|---|
| `=>` | Arrow function | `const fetchBook = async id => { ... }` | A shorter way to write a function. `(x) => x * 2` is the same as `function(x) { return x * 2 }`. |
| `...` | Spread operator | `[...bookIds, id]` | Copies all items from an array (or properties from an object) into a new one. `[...bookIds, id]` means "all existing book IDs, plus this new one". |
| `? :` | Ternary operator | `saved ? JSON.parse(saved) : defaults` | An inline if/else. `condition ? valueIfTrue : valueIfFalse`. |
| `&&` | Logical AND (short-circuit) | `{loading && <p>Loading...</p>}` | In JSX, this means "if the left side is true, render the right side". If `loading` is false, nothing renders. |
| `!` | Logical NOT | `!loading` | Flips true to false and vice versa. `!loading` means "when loading is finished". |
| `===` | Strict equality | `location.pathname === '/'` | Checks if two values are exactly equal (same value AND same type). Always use `===` instead of `==` in JavaScript. |
| `!==` | Strict inequality | `t !== id` | The opposite of `===`. True when values are NOT equal. |
| `${}` | Template literal | `` `https://openlibrary.org/works/${id}.json` `` | Embeds a variable's value inside a string. The string must use backticks (`` ` ``), not regular quotes. |
| `{}` | Curly braces (JSX) | `{book.title}` | In JSX, curly braces mean "evaluate this JavaScript expression". Without them, React would render the literal text "book.title". |
| `()` | Grouping / function call | `setBooks(libraryResults)` | Calls a function with arguments, or groups expressions for clarity. |
| `[]` | Array / bracket access | `book.covers[0]` | Creates an array or accesses an item by index. `[0]` gets the first item. |

### React & JSX Specific Syntax

| Symbol / Pattern | Example | What it means |
|---|---|---|
| `<Component />` | `<Navbar />` | Renders a React component. The self-closing `/>`  means it has no children. |
| `<Component>...</Component>` | `<BookProvider>{children}</BookProvider>` | Renders a component WITH children nested inside it. |
| `<> </>` | `<>...</>` | A React Fragment — lets you return multiple elements without adding an extra `<div>` to the DOM. |
| `className` | `className="text-xl"` | The JSX equivalent of HTML's `class` attribute. React uses `className` because `class` is a reserved word in JavaScript. |
| `{children}` | `{ children }` in function params | A special React prop — it represents whatever JSX is placed between the opening and closing tags of a component. |
| `key={...}` | `key={bookIds[i]}` | A special prop React uses to track items in a list. It must be unique among siblings. Helps React update the DOM efficiently. |
| `onClick={...}` | `onClick={() => handleAdd(book)}` | An event handler — runs the function when the element is clicked. React uses camelCase (`onClick`) instead of HTML's `onclick`. |
| `onChange={...}` | `onChange={e => setQuery(e.target.value)}` | Fires every time the input value changes. `e.target.value` is the current text in the input field. |
| `disabled={...}` | `disabled={alreadyAdded}` | A boolean prop — if true, the button can't be clicked. |

### Destructuring Syntax

| Pattern | Example | What it means |
|---|---|---|
| `const { x, y } = obj` | `const { bookIds, takenIds } = useBooks()` | Object destructuring — pulls specific properties out of an object into separate variables. Same as `const bookIds = useBooks().bookIds`. |
| `const [x, y] = arr` | `const [books, setBooks] = useState([])` | Array destructuring — pulls items out of an array by position. `useState` returns a 2-element array: the value and its setter function. |
| `{ children }` in params | `function BookProvider({ children })` | Destructures the props object right in the function signature. Same as `function BookProvider(props) { const children = props.children }`. |

### Import / Export

| Pattern | Example | What it means |
|---|---|---|
| `import X from './file'` | `import App from './App.jsx'` | Imports the **default export** from a file. Each file can have one default export. |
| `import { X } from './file'` | `import { useBooks } from '../context/BookContext'` | Imports a **named export**. The curly braces must match the exact exported name. A file can have many named exports. |
| `export default X` | `export default App` | Makes this the default export of the file. |
| `export function X` | `export function useBooks()` | A named export — importers must use `{ useBooks }` with curly braces. |

### async/await & Promises

| Pattern | Example | What it means |
|---|---|---|
| `async function` | `async function fetchAll() { ... }` | Marks a function as asynchronous — it can use `await` inside and always returns a Promise. |
| `await` | `await fetch(url)` | Pauses execution until the Promise resolves and gives you the result. Without `await`, you'd get a Promise object instead of the actual data. |
| `.then()` | `fetch(url).then(res => res.json())` | Another way to handle Promises. Chains a callback that runs when the Promise resolves. Can be combined with `await`. |
| `Promise.all([...])` | `Promise.all(bookIds.map(fetchBook))` | Takes an array of Promises and waits for ALL of them to finish. Returns an array of all results. Much faster than awaiting them one by one. |
| `try { } catch (err) { }` | Used in fetchAll | Wraps code that might throw an error. If anything inside `try` fails, execution jumps to `catch` instead of crashing the app. |
