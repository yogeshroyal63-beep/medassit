/**
 * Alias shim — the canonical App component lives at src/App.jsx.
 *
 * src/App.jsx  ← canonical entry point (imported by src/main.jsx)
 * src/app/App.jsx ← this file; a re-export alias for tools that resolve
 *                   from the feature-slice app/ folder.
 *
 * Do not add logic here. All changes belong in src/App.jsx.
 */
export { default } from "../App";
