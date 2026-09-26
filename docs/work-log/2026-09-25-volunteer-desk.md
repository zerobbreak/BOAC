# Volunteer desk

## Exact process

1. Read `backend/src/volunteer-work.ts`. `GET /volunteer/dashboard` returns `profile`, `schedule.upcoming`, `schedule.finished`, and `spaces`. `GET /volunteer/work` returns that volunteer’s rows. `POST /volunteer/work` creates a row from `title` and optional `notes`. `PATCH /volunteer/work/:id` accepts `title`, `status` (`planned`, `in_progress`, `done`), `notes`, and `hours`.
2. Read `frontend/src/App.tsx`. A session whose role was not `admin` stopped at “This desk is for an admin account.” The admin nav stayed Desk, Content, Library, Opportunities, Applications, Assign.
3. Added `frontend/src/pages/volunteer.ts` with the `WorkItem` and `VolunteerDashboard` shapes, plus `when` and `place` for start time and location.
4. Added `VolunteerHomePage` (`GET /volunteer/dashboard`), `VolunteerWorkPage` (`GET`/`POST`/`PATCH /volunteer/work`), and `VolunteerSpacesPage` (spaces from the dashboard payload).
5. Updated `frontend/src/App.tsx` so role `volunteer` gets Schedule (`/`), Work (`/work`), and Spaces (`/spaces`). Role `admin` keeps the existing routes. Any other signed-in role sees “This desk is for an admin or volunteer account.”
6. Updated `frontend/src/pages/LoginPage.tsx` so both `admin` and `volunteer` leave the sign-in form for `/`. The heading is “Sign in to your desk.”
7. Added `.panel { padding: 1rem; }` in `frontend/src/styles.css` so the “Add your own work” form matches the other desk panels.
8. Ran `npx tsc --noEmit` in `frontend/`. Exit code 0.
9. Started `npm run dev` in `frontend/`. Vite reported `http://localhost:5173/`.
10. Opened `http://localhost:5173/login`. The page showed “BOAC”, “Sign in to your desk”, Email, Password, and Enter.
11. Opened `http://localhost:5173/work` with no session. The app showed “Opening the desk…”, then returned to `http://localhost:5173/login`.
12. A signed-in volunteer pass was not run. The volunteer password is not in the local env that is available to this session, so Schedule, Work, and Spaces were not clicked while authenticated.

## Reasoning

- **Same React app.** The admin desk already uses Vite, React Router, `better-auth/react`, and `api()` with cookie credentials. A second app would repeat the session client. The volunteer routes already exist on the API.
- **Role chooses the nav.** `requireVolunteer` rejects an admin session, and `requireAdmin` rejects a volunteer session. Showing both navs to one user would send them into 403s. The shell reads `data.user.role` and mounts one set of routes.
- **Schedule, work, and spaces match the API groups.** Upcoming and finished come from `schedule`. Spaces are the dashboard’s location groups, not a new collection. Hours, status, and notes are the fields `PATCH /volunteer/work/:id` already accepts. The volunteer cannot set `startsAt`; that stays an admin assignment field.
- **Own work is a separate form.** `POST /volunteer/work` does not take an opportunity or a start time. The form only sends `title` and `notes`, which is what that route stores.
- **Login copy is shared.** One email-and-password form already talks to Better Auth. The redirect after sign-in depends on role, so the page no longer says it is only the admin desk.

## Work done

- `frontend/src/pages/volunteer.ts` — shared `WorkItem` and `VolunteerDashboard` types, and the `when` and `place` labels used by the volunteer pages.
- `frontend/src/pages/VolunteerHomePage.tsx` — loads `GET /volunteer/dashboard` and lists upcoming and finished shifts with start time, place, status, and recorded hours.
- `frontend/src/pages/VolunteerWorkPage.tsx` — loads `GET /volunteer/work`, sets status, hours, and notes with `PATCH /volunteer/work/:id`, and adds a row with `POST /volunteer/work`.
- `frontend/src/pages/VolunteerSpacesPage.tsx` — loads `GET /volunteer/dashboard` and groups assignments by space name.
- `frontend/src/App.tsx` — volunteer sessions see Schedule, Work, and Spaces; admin sessions keep the admin desk; other roles are turned away.
- `frontend/src/pages/LoginPage.tsx` — heading is “Sign in to your desk”; an `admin` or `volunteer` session is sent to `/`.
- `frontend/src/styles.css` — `.panel` has `padding: 1rem` so the add-work form has the same inset as the other desk cards.
