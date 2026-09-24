# Admin authentication

## Exact process

1. Confirmed `backend/.env` already had `MONGODB_URI` and was missing `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
2. Added `backend/src/passwords.ts` (scrypt `passHash`) and `backend/src/auth.ts` (admin login, HS256 session JWT, httpOnly `session` cookie, `requireAuth`, and `ensureAdminUser`).
3. Wired `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, and `GET /admin` in `backend/src/index.ts`. Login and `/admin` accept only the `admin` role. The server calls `ensureAdminUser` after it starts listening.
4. Called `ensureAdminUser` from `backend/src/setup-db.ts` after `ensureSchema`. Documented `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env.example`.
5. Appended a 32-byte hex `JWT_SECRET`, `ADMIN_EMAIL=admin@boac.local`, and a generated `ADMIN_PASSWORD` to `backend/.env`.
6. Ran `npx tsc --noEmit` from `backend`. It exited 0.
7. Ran `npm run db:setup` from `backend`. It printed `Admin user created: admin@boac.local` and `Database schema is ready`.
8. Started `npm run dev`. It logged `Server is running on http://localhost:3000` and `Admin user already exists: admin@boac.local`.
9. Against `http://localhost:3000`: wrong password returned `401`; correct password returned `200` with role `admin`, a token, and an `HttpOnly` `session` cookie; `GET /admin` without a token returned `401`; `GET /admin` with `Authorization: Bearer` returned `200` and the five admin permissions; `GET /auth/me` with the cookie returned `200`; `POST /auth/logout` cleared the cookie (`Max-Age=0`).
10. Stopped the dev server with `taskkill`.

## Work done

- Admin sign-in lives on `POST /auth/login`. A valid admin gets a 12-hour HS256 JWT in the JSON body and in an httpOnly `session` cookie. `POST /auth/logout` clears that cookie. `GET /auth/me` and `GET /admin` require that session and reject anyone whose role is not `admin`.
- Passwords are stored as `scrypt$<salt>$<hash>` in `users.passHash`. The password hash is not returned by the API.
- The first admin document is `admin@boac.local` in database `boac`, linked to the seeded `admin` role. `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET` are in `backend/.env` only. A later `db:setup` or server start does not replace that user.
- `backend/.env.example` lists the three new variables without values.
