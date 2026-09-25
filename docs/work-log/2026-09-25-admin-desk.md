# BOAC admin desk

## Exact process

1. The API already allows `http://localhost:5173` with credentials and mounts Better Auth at `/api/auth`. Admin routes already exist for content, categories, tags, opportunities, applications, and assignments.
2. Created `frontend/` as a Vite React TypeScript app on port 5173. Auth uses `better-auth/react` with `adminClient` and the same access-control roles as `backend/src/permissions.ts`. Requests use `credentials: 'include'` against `VITE_API_URL` (default `http://localhost:3000`).
3. Screens: sign-in, desk (`GET /admin`), content (draft, publish, cover, delete), library (categories and tags), opportunities, application review (status, notes, file preview, one-time password), and assign (volunteer list from Better Auth plus `POST /admin/assignments`).
4. `npm install` and `npx tsc --noEmit` in `frontend` exited 0. `npm run dev` served `http://localhost:5173/login`. The page showed the sign-in form: email, password, and Enter.
5. `backend/.env` is missing, so the API was not started and sign-in was not completed.

## Reasoning

- **Vite on 5173 matches the API CORS origin.** A separate React app keeps the Railway service rooted at `backend/`. Better Auth’s React client talks to the Hono base URL and sends the session cookie. A Next.js app would have needed a different origin and a second server.
- **The desk calls the existing admin routes.** It does not reimplement auth. The shell allows only `role === admin`.
- **The public site and the volunteer dashboard are not in this app.** The request was the admin desk. Those routes stay on the API for a later screen.
- **Application images are fetched with the cookie and shown from a blob URL.** A plain `<img src>` to port 3000 would not send the admin session.

## Work done

- `frontend/package.json` — Vite, React 19, React Router 7, and `better-auth`.
- `frontend/src/auth.ts` and `frontend/src/access.ts` — Better Auth client pointed at the API, with the admin plugin roles.
- `frontend/src/api.ts` — cookie-authenticated JSON and file fetches.
- `frontend/src/App.tsx` — sign-in gate and the desk navigation.
- `frontend/src/pages/LoginPage.tsx` — email and password sign-in.
- `frontend/src/pages/DeskPage.tsx` — `GET /admin`.
- `frontend/src/pages/ContentPage.tsx` — drafts, publish, cover upload, delete.
- `frontend/src/pages/TaxonomyPage.tsx` — categories and tags.
- `frontend/src/pages/OpportunitiesPage.tsx` — create and open or close.
- `frontend/src/pages/ApplicationsPage.tsx` — review moves, notes, files, and the one-time password.
- `frontend/src/pages/AssignPage.tsx` — assign a volunteer to an opportunity.
- `frontend/src/styles.css` — paper desk layout, Fraunces and Newsreader.
- `frontend/.env.example` — `VITE_API_URL=http://localhost:3000`.
