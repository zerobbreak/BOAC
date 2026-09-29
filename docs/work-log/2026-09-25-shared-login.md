# Shared login

## Exact process

1. Read `frontend/src/App.tsx` and `frontend/src/pages/LoginPage.tsx`. Both already used one route, `/login`, and `authClient.signIn.email`. After sign-in, the shell read `data.user.role` and labeled the sidebar “Desk” or “Volunteer”. The login page only sent `admin` and `volunteer` sessions to `/`.
2. Read `backend/src/auth.ts`. Sign-in looks up the Better Auth user by email. `ensureAdminUser` and `ensureVolunteerUser` create that user with a role. `provisionVolunteer` creates a volunteer user for an accepted application email, or returns the existing volunteer with that email.
3. Changed `LoginPage` so any signed-in account goes to `/`. The heading is “Sign in”.
4. Changed the sidebar in `App.tsx` to show `data.user.name` and `data.user.email` from the session. The role on that same account still chooses admin pages or volunteer pages.
5. Changed `frontend/index.html` title from “BOAC desk” to “BOAC”.
6. Opened `http://localhost:5173/login`. The page title was “BOAC”, the heading was “Sign in”, and the form had Email, Password, and Enter. A signed-in pass was not run, because the local passwords are not available in this session.

## Reasoning

- **One address.** Admins and volunteers already share Better Auth at `/api/auth` and one React route at `/login`. A second login page would ask the person to pick a desk before the account is known.
- **The account is the identity.** Email is the lookup key on the Better Auth `user` record. The role stored when that account was created (`admin` from the admin seed, `volunteer` from accept or the volunteer seed) is what the API checks. The client does not ask which kind of user they are.
- **The sidebar names the person.** “Desk” and “Volunteer” described the product, not the account. Name and email come from the session user, so the open desk shows who signed in. The role on that user still selects the pages, because `/admin/*` and `/volunteer/*` reject the other role.

## Work done

- `frontend/src/pages/LoginPage.tsx` — one form at `/login`. Any existing session redirects to `/`. The heading is “Sign in”. Email and password still call `authClient.signIn.email`.
- `frontend/src/App.tsx` — the sidebar shows the session user’s name and email. `data.user.role` from that account still mounts the admin routes or the volunteer routes.
- `frontend/index.html` — document title is “BOAC”.
