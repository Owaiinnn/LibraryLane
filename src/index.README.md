# index.css — Global Styles

## Language

CSS (Cascading Style Sheets), with Tailwind CSS v4 imported via `@import`.

## What This File Does

This is the only CSS file in the project. It's imported in `main.jsx`, which means these styles apply to the entire application. It does three things:

1. Imports Tailwind CSS
2. Sets `box-sizing: border-box` on all elements
3. Resets body margin and sets the font

## Line-by-Line Breakdown

### `@import "tailwindcss";`

This pulls in Tailwind CSS — a utility-first CSS framework. Once imported, you can use Tailwind's utility classes anywhere in your JSX.

**What is "utility-first"?**
Instead of writing custom CSS classes like:
```css
.card { padding: 16px; border-radius: 8px; background: white; }
```
You compose styles directly in your HTML/JSX using small, single-purpose classes:
```jsx
<div className="p-4 rounded-lg bg-white">
```

Each class does one thing: `p-4` = padding, `rounded-lg` = border-radius, `bg-white` = background colour.

This is why there's so little CSS in this file — almost all styling is done via Tailwind classes in the JSX components.

### `* { box-sizing: border-box; }`

The `*` selector targets EVERY element on the page.

**What does `box-sizing: border-box` do?**
- By default (`content-box`), CSS adds padding and border OUTSIDE an element's width/height
- With `border-box`, padding and border are INCLUDED in the width/height
- Example: a `width: 200px` box with `padding: 20px`
  - `content-box`: total width = 240px (200 + 20 + 20) — confusing!
  - `border-box`: total width = 200px (content shrinks to fit) — predictable!
- Nearly every modern project sets this globally because it makes layouts much easier to reason about

### `body { margin: 0; font-family: system-ui, sans-serif; }`

- `margin: 0` removes the browser's default body margin (browsers add a small margin by default, usually 8px, which creates an unwanted gap around the page)
- `font-family: system-ui, sans-serif` uses the operating system's default font:
  - San Francisco on macOS/iOS
  - Segoe UI on Windows
  - Roboto on Android
  - `sans-serif` is the fallback if `system-ui` isn't supported
  - This makes the app feel native to the user's platform and loads instantly (no font download needed)

## Symbols Used

| Symbol | Where | Meaning |
|---|---|---|
| `@import` | Line 1 | CSS at-rule — imports another stylesheet or framework |
| `*` | Selector | Universal selector — matches every HTML element |
| `{ }` | CSS | Curly braces wrap the declarations (property-value pairs) for a selector |
| `:` | CSS | Separates a CSS property from its value (e.g., `margin: 0`) |
| `;` | CSS | Ends a CSS declaration |
| `,` | Font stack | Separates fallback fonts — browser tries each in order |
