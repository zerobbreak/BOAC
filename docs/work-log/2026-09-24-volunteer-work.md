# Volunteer auth and work tracking

## Exact process

1. Read `backend/src/schema.ts`, `backend/src/auth.ts`, `backend/src/permissions.ts`, and `backend/src/index.ts`. Auth had an `admin` session gate on `GET /admin`. `volunteer_applications` stored public applications with no account id. Better Auth user ids are Mongo ObjectIds exposed as hex strings.
2. Added `track_work` and the `volunteer_work` collection in `backend/src/schema.ts`, plus a `volunteer` seed role. Seed updates now `$set` permissions. `npx tsc --noEmit` from `backend` exited 0 after the route and auth changes.
3. Appended `VOLUNTEER_EMAIL=volunteer@boac.local` and `VOLUNTEER_PASSWORD` to `backend/.env` without printing the password.
4. Ran `npm run db:setup` from `backend`. It printed `Admin user already exists: admin@boac.local`, `Volunteer user created: volunteer@boac.local`, and `Database schema is ready`.
5. Started `npm run dev`. It logged both users as already existing.
6. Against `http://localhost:3000`: volunteer sign-in returned `200` and role `volunteer`. `GET /volunteer/work` with no cookie returned `401`. Admin sign-in returned `200` and role `admin`; that cookie on `GET /volunteer/work` returned `403`. `POST /volunteer/work` with title `Saturday shift` returned `201` and status `planned`. `PATCH /volunteer/work/:id` with status `in_progress` returned `200`. A `volunteer_work` document inserted for a different `volunteerId` stayed out of the list; the list returned `200` and only `Saturday shift`.
7. Stopped the dev server with `taskkill`.

## Reasoning

- **Separate `volunteer_work` from `volunteer_applications`.** Applications are public submissions (`fullName`, `email`, review status) and have no signed-in owner. Work tracking needs a row the session user owns, so a new collection was added instead of overloading applications.
- **`volunteerId` is an ObjectId.** Better Auth's Mongo adapter generates ObjectId hex ids and returns that hex as `user.id`. The work query uses `new ObjectId(session.user.id)`, which matches the stored id.
- **The volunteer route allows only the `volunteer` role.** "Respective work" means the signed-in volunteer sees their own rows. An admin session is a different person, so `GET /volunteer/work` returns `403` for an admin rather than listing every volunteer's work. No session returns `401`.
- **Public sign-up stays off.** The first volunteer is created the same way as the admin, from `VOLUNTEER_EMAIL` and `VOLUNTEER_PASSWORD`, with Better Auth role `volunteer`. Later volunteers are created by an admin through Better Auth's admin user API with that role.
- **Two role stores.** Better Auth `backend/src/permissions.ts` grants the volunteer role `work: ['track']` for the future React `adminClient`. The Mongo `roles` document `volunteer` gets `track_work` so the domain role list matches. Seed uses `$set` on permissions so an existing role document picks up the new permission list on the next `db:setup`.
- **A foreign row is hidden by the query, not by the client.** The list filter is `{ volunteerId }`. The check inserted another volunteer's document and confirmed the list still contained only `Saturday shift`.

## Work done

- `backend/src/schema.ts` — `permissions` includes `track_work`. Collection `volunteer_work` requires `volunteerId`, `title`, `status` (`planned`, `in_progress`, `done`), `createdAt`, and `updatedAt`, with optional `notes` and `opportunityId`. Index is `volunteerId` + `updatedAt` descending. Seeded role `volunteer` has `['track_work']`. Admin's seeded permissions now include `track_work` because the admin seed is the full permission list.
- `backend/src/permissions.ts` — Better Auth access control adds `work: ['track']` and a `volunteer` role with that action. `roles` now exports `admin`, `editor`, `reviewer`, `user`, and `volunteer`.
- `backend/src/auth.ts` — `requireAdmin` and `requireVolunteer` share a role check. Missing session is `401`; the wrong role is `403`. `ensureVolunteerUser` creates `volunteer@boac.local` with role `volunteer` when that email is not already a Better Auth user.
- `backend/src/volunteer-work.ts` — `GET /volunteer/work` lists the signed-in volunteer's items, newest update first. `POST /volunteer/work` creates one (`title` required, status defaults to `planned`). `PATCH /volunteer/work/:id` updates `title`, `status`, or `notes` only when `volunteerId` matches the session. Someone else's id returns `404`.
- `backend/src/index.ts` — mounts the volunteer router at `/volunteer` and creates the volunteer user on startup alongside the admin.
- `backend/src/setup-db.ts` — calls `ensureVolunteerUser` after `ensureAdminUser`.
- `backend/.env.example` — documents `VOLUNTEER_EMAIL` and `VOLUNTEER_PASSWORD`.
- `backend/.env` — holds `VOLUNTEER_EMAIL=volunteer@boac.local` and `VOLUNTEER_PASSWORD`. The password is only in that file.
