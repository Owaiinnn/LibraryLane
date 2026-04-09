# Navbar.jsx — Navigation Bar

## Language

JavaScript (ES6+) with JSX syntax. Uses `react-router-dom` for navigation.

## What This File Does

Renders the green navigation bar at the top of every page. It's a **presentational component** — it doesn't manage any state of its own and doesn't fetch data. It just displays UI based on the current URL.

It shows:
- The app logo ("LibraryLane") which links to the homepage
- Two nav links: "Home" and "Add Book"
- An underline on whichever link matches the current page

## Detailed Breakdown

### Imports

```jsx
import { Link, useLocation } from 'react-router-dom'
```

**`Link`** — React Router's replacement for the HTML `<a>` tag. The difference:
- `<a href="/search">` causes a full page reload (browser fetches new HTML from the server)
- `<Link to="/search">` intercepts the click, updates the URL via the History API, and React Router swaps the component — no reload, no server request, instant navigation

**`useLocation`** — a React Router hook that returns an object describing the current URL:
```js
{ pathname: "/search", search: "", hash: "", state: null, key: "default" }
```
We use `pathname` to check which page the user is on.

### The Component

```jsx
function Navbar() {
  const location = useLocation()
```
Calling the hook gives us the current location object. This value updates automatically when the URL changes (React Router triggers a re-render).

### The Nav Element

```jsx
<nav className="bg-green-700 text-white px-6 py-4 flex items-center justify-between">
```
- `<nav>` is a semantic HTML5 element — tells browsers and screen readers "this contains navigation links"
- Tailwind classes:
  - `bg-green-700` → dark green background
  - `text-white` → white text colour for all child elements
  - `px-6` → horizontal padding 1.5rem (24px)
  - `py-4` → vertical padding 1rem (16px)
  - `flex` → `display: flex` (enables flexbox layout)
  - `items-center` → `align-items: center` (vertically centres children)
  - `justify-between` → `justify-content: space-between` (pushes children to opposite ends — logo left, links right)

### Conditional Active Link Styling

```jsx
className={`text-sm font-medium hover:underline ${location.pathname === '/' ? 'underline' : ''}`}
```

This line does several things:

1. **Template literal** (backticks `` ` ` ``): lets us embed JavaScript expressions with `${...}`
2. **Static classes**: `text-sm font-medium hover:underline` always apply
3. **Dynamic class**: `${location.pathname === '/' ? 'underline' : ''}`
   - If the current path is `/`, add the class `underline` (visually marks the active link)
   - If not, add an empty string (no extra class)
4. **`hover:underline`** is a Tailwind modifier — the underline only appears when the user hovers their mouse over the link

### Export

```jsx
export default Navbar
```
Default export — other files import it as `import Navbar from './components/Navbar'`.

## Symbols Used

| Symbol | Where | Meaning |
|---|---|---|
| `{ Link, useLocation }` | Import | Named imports from react-router-dom |
| `` ` ` `` | className | Template literal — a string that can contain embedded expressions |
| `${ }` | className | Template expression — evaluates the JavaScript inside and inserts the result into the string |
| `===` | Ternary condition | Strict equality check — is `pathname` exactly equal to `'/'`? |
| `? :` | className | Ternary operator — `condition ? 'underline' : ''` (if true → underline, if false → nothing) |
| `to="/"` | Link prop | The destination URL — equivalent to `href` on an `<a>` tag |
