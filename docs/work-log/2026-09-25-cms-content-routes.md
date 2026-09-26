# CMS content routes

## Exact process

1. Read `backend/src/schema.ts`, `backend/src/auth.ts`, `backend/src/permissions.ts`, and `backend/src/index.ts`. `content` already required `type` (`post` or `article`), `title`, `body`, `status` (`draft` or `published`), `authorId`, and timestamps, with optional `categoryId` and up to 20 `tagIds`. `GET /admin` only checked that the session role was `admin`.
2. Added `requireStaff` and `staffRole` in `backend/src/auth.ts`. `requireStaff` calls Better Auth `userHasPermission` for `staff.manage_content` or `staff.publish_content`.
3. Added `backend/src/content.ts` with public reads and dashboard writes for content, categories, and tags. Mounted them from `backend/src/index.ts`.
4. `node_modules` was missing, so `npm install` was run in `backend` (71 packages). `npm exec tsc -- --noEmit` then exited 0 after fixing the role argument to the permission union `admin | editor | reviewer | user | volunteer`.
5. Started `npm run dev`. It printed `injected env (0) from .env` and threw `Set MONGODB_URI or MONGO_URL` from `backend/src/db.ts`. `backend/.env` is not on disk (`exists false`). The dev server was stopped with `taskkill`. The HTTP routes were not exercised.

## Reasoning

- **Dashboard writes sit under `/admin`, public reads sit at `/content`, `/categories`, and `/tags`.** The public page should list what visitors see. Drafts stay off those routes because the content schema uses `status: published` for that, matching the earlier public-versus-admin research.
- **Creating and editing requires `manage_content`. Changing `status` requires `publish_content`.** The admin role already has both staff actions. An editor role has both too, but `app.route('/admin', admin)` still applies `requireAdmin` first, so only an `admin` session reaches the dashboard routes today. The extra permission check is what blocks a future non-publishing role from flipping `status` if that admin gate is loosened.
- **`authorId` is the signed-in user's id as an ObjectId.** Better Auth's Mongo adapter stores user ids as ObjectIds and returns the hex string on the session, which is the same id shape `content.authorId` already requires.
- **Categories and tags are their own routes.** Content only stores ids. The public page can load `/categories` and `/tags` and match them to `categoryId` and `tagIds`. A category or tag id that is not in those collections is rejected on write.
- **Live checks did not run.** `backend/.env` is gone, so MongoDB never connected. Typecheck is the only verification from this session.

## Work done

- `backend/src/auth.ts` — `requireStaff('manage_content' | 'publish_content')` returns `401` with no session and `403` when `userHasPermission` fails. `staffRole` narrows the session role to the Better Auth role union before that call.
- `backend/src/content.ts` — public `GET /content` and `GET /content/:id` return only `status: published` (`type`, `categoryId`, and `tagId` filters on the list). Public `GET /categories` and `GET /tags` list names. Dashboard `GET/POST /admin/content`, `PATCH/DELETE /admin/content/:id` manage items; a new item defaults to `draft` and `type: post`. `POST/PATCH/DELETE` for `/admin/categories` and `/admin/tags` manage names. A duplicate name returns `409`. Publishing, or any status change, returns `403` without `publish_content`.
- `backend/src/index.ts` — mounts the dashboard routers on the existing `/admin` app and the public content router at `/`.
- `backend/package-lock.json` — updated by `npm install` after `node_modules` was absent.
