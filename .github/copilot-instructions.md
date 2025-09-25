<!-- .github/copilot-instructions.md: guidance for AI coding agents working on HelperHub -->
# HelperHub — Copilot instructions

This file gives focused, actionable guidance for automated coding agents (Copilot-style) when making changes to the HelperHub React/Vite project. Keep changes small, test locally with Vite, and prefer non-breaking edits for UI and Firebase wiring.

Summary (big picture)
- Frontend-only single-page React app built with Vite (see `package.json` scripts and `vite.config.js`).
- Firebase is used directly in the frontend for Authentication, Realtime Database and Storage (see `src/firebase.js`, `src/auth.js`, `src/db.js`). There is no backend server in this repository.
- Routing is client-side using `react-router-dom` (see `src/App.jsx` and `src/components/*.jsx`).

Quick developer workflows (commands to run locally)
- Install dependencies: `npm install` in the repository root (the workspace root contains `package.json`).
- Start dev server: `npm run dev` — opens Vite dev server (default port 5173). Use this to smoke-test UI changes.
- Build for production: `npm run build`.
- Preview production build locally: `npm run preview` after `npm run build`.

Project-specific conventions and patterns
- Firebase initialization: `src/firebase.js` exports `auth`, `storage`, and `database`. Other modules import app via default `app` export or named exports from that file. When changing Firebase keys, prefer using environment variables (Vite `import.meta.env`) rather than hardcoding secrets.
- Routing: `src/App.jsx` centralizes routes. New pages should be added to `src/components` and wired into `App.jsx` routes.
- Styling: simple CSS files live under `src/styles` and component CSS filenames match component names (e.g., `HomePage.jsx` → `HomePage.css`). Follow existing class names and file placement.
- Assets: static images are under `public/images/` and referenced with absolute paths (e.g., `/images/logo.png`) or imported from `src/assets`.

Integration points and external dependencies
- Firebase SDK (client): configured in `src/firebase.js`. There is direct client access to Realtime Database (`getDatabase`) and Firestore (`getFirestore` via `src/db.js`). Be cautious: changes to database structure must match the Firestore/Realtime consumers in other components.
- React Router: v7.x is used. Routes sometimes reuse `ProfilePage` for multiple paths (see `/profile`, `/edit-profile`, `/service/:serviceType`). Verify URL params handling when modifying `ProfilePage`.
- Vite plugins: `@vitejs/plugin-react` is present in `devDependencies` and used via `vite.config.js`.

Files and locations to reference for common tasks
- Start point: `src/main.jsx` — renders `App` into `#root`.
- Routing: `src/App.jsx`.
- Firebase: `src/firebase.js`, `src/auth.js`, `src/db.js`.
- Main pages/components: `src/components/` — `LandingPage.jsx`, `SignupPage.jsx`, `HomePage.jsx`, `ProfilePage.jsx`, `ServiceProvidersPage.jsx`, `SettingsPage.jsx`, `UserProfile.jsx`.
- Styles: `src/styles/*.css`.

Testing and verification guidance
- After changes, run `npm run dev` and open the URL shown by Vite (usually http://localhost:5173). Verify navigation between routes and Firebase flows (signup/login) if modified.
- If a change touches Firebase config, ensure `.env` usage is added and `.gitignore` keeps env files out of the repo (the repo already ignores `*.env`).

Safety and non-regression rules for agents
- Do not commit real Firebase secrets or `.env` values into source. Prefer adding placeholders in code and instructing the developer to set values in `.env` (Vite expects variables prefixed with `VITE_`).
- Avoid large refactors across multiple components in a single automated edit. Prefer incremental PRs with one feature/fix per change.

Examples (concrete references)
- To add a new page: create `src/components/MyPage.jsx`, `src/styles/MyPage.css`, then add a route in `src/App.jsx`:
  - `import MyPage from './components/MyPage';`
  - `<Route path="/my-page" element={<MyPage />} />`
- To read/write Realtime Database: follow `src/firebase.js` exports and use `import { database } from './firebase'` (or `import app from './firebase'` where appropriate). Keep usage consistent with current helpers.

If anything in this file seems incomplete or you need more examples (specific component wiring, tests, or build details), ask and I'll expand the instructions or merge with existing docs.
