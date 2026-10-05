# Better Auth backend for the React client

## Exact process

1. Installed `better-auth` `1.7.6` and `@better-auth/mongo-adapter` in `backend` with `npm install`.
2. Replaced the custom JWT login in `backend/src/auth.ts` with a Better Auth instance: MongoDB adapter on the existing client, email and password enabled, public sign-up disabled, and the admin plugin.
3. Mapped the existing staff permissions in `backend/src/permissions.ts` through Better Auth access control: `admin` (all five `staff` actions plus the plugin's admin statements), `editor` (`manage_content`, `publish_content`), `reviewer` (`manage_opportunities`, `review_applications`), and `user` (no staff actions).
4. Mounted `POST` and `GET` `/api/auth/*` on the Hono app. CORS allows `FRONTEND_ORIGIN` (`http://localhost:5173` by default) with credentials. `GET /admin` uses `requireAdmin`, which reads the Better Auth session and allows only the `admin` role.
5. `ensureAdminUser` now creates the first admin through Better Auth (`user` + credential `account`) instead of `users.passHash`. `backend/src/setup-db.ts` and server startup both call it. Removed `backend/src/passwords.ts`.
6. Updated `backend/.env.example` with `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `FRONTEND_ORIGIN`. Appended those to `backend/.env`, copying the existing `JWT_SECRET` into `BETTER_AUTH_SECRET`.
7. Ran `npx tsc --noEmit` from `backend`. It exited 0.
8. Ran `npm run db:setup`. It printed `Admin user created: admin@boac.local` and `Database schema is ready`.
9. Started `npm run dev`. It logged `Admin user already exists: admin@boac.local`.
10. Against `http://localhost:3000` with `Origin: http://localhost:5173`: `POST /api/auth/sign-up/email` returned `400` `EMAIL_PASSWORD_SIGN_UP_DISABLED`; a wrong password on `POST /api/auth/sign-in/email` returned `401`; the admin password returned `200` with role `admin`, an HttpOnly cookie, `access-control-allow-origin: http://localhost:5173`, and `access-control-allow-credentials: true`. `GET /admin` without a cookie returned `401`. With the session cookie, `GET /admin` and `GET /api/auth/get-session` returned `200` and role `admin`.
11. Stopped the dev server with `taskkill`. No React app was created.

## Work done

- The API Better Auth base path is `/api/auth`. A future React client uses `createAuthClient` from `better-auth/react` with `baseURL: "http://localhost:3000"` and `adminClient` from `better-auth/client/plugins`, passing the same access control and roles as `backend/src/permissions.ts`.
- Sign-in is `POST /api/auth/sign-in/email`. The session is the Better Auth cookie. Public sign-up is off. `GET /admin` requires an `admin` session.
- The Better Auth admin is `admin@boac.local` in the `user` collection, role `admin`, with a credential row in `account`. `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=http://localhost:3000`, and `FRONTEND_ORIGIN=http://localhost:5173` are in `backend/.env`.
- The earlier `users` document for that email is unused by Better Auth. The `roles` collection is still seeded by schema setup.
