# Volunteer applications, review, and content covers

## Exact process

1. The grilling rounds settled the design: one optional content cover, up to three private application images, anonymous public apply, admin review through `under_review` to `needs_info`, `declined`, or `accepted`, and accept provisioning a volunteer plus a work item. Email stays out of scope. Opportunities are created by an admin and are not deleted.
2. Extended `backend/src/schema.ts`: `content.coverKey`, application `fileKeys` (max 3), statuses `submitted`, `under_review`, `needs_info`, `declined`, `accepted`. Before `collMod`, existing `contacted` applications are rewritten to `under_review`. A partial unique index on `email` + `opportunityId` allows another application only when the earlier status is `declined`.
3. Added `backend/src/storage.ts` for JPEG, PNG, and WebP checks (5 MB) and bucket put, get, and delete. Added `provisionVolunteer` in `backend/src/auth.ts`.
4. Cover routes and `coverUrl` were added in `backend/src/content.ts`. Opportunity routes were added in `backend/src/opportunities.ts`. Application submit and review were added in `backend/src/applications.ts`. `backend/src/index.ts` mounts them.
5. `npm exec tsc -- --noEmit` from `backend` exited 0.
6. `backend/.env` is not on disk, so `npm run dev` was not started and the HTTP routes were not exercised.

## Reasoning

- **Covers attach after the content row exists.** The object key is `content/{id}/cover`. The public page only receives `coverUrl` when the item is published. Draft bytes are served from the admin cover route.
- **The public form is one multipart request.** An anonymous visitor cannot upload into the bucket without an application. If insert fails, the objects just written are deleted.
- **Accept does its side effects before the status write.** A volunteer is provisioned and a `planned` work item titled with the opportunity is inserted first. The status changes only if those succeed. An email that already belongs to a non-volunteer aborts and leaves the application as it was. An existing volunteer is reused and `password` is `null`. A later accept after `declined` inserts another work item.
- **The one-time password is only in the accept JSON.** It is hashed into the Better Auth credential account and is not stored in plaintext.
- **Closing an opportunity does not freeze review.** New public submits require `public: true` and `status: open`. An application already stored can still move. Opportunities have no delete route because applications keep `opportunityId`.
- **`internalNotes` is required for `needs_info` and `declined`.** It is optional for `under_review` and `accepted`. The public response does not include it or the file keys.

## Work done

- `backend/src/schema.ts` — cover key, application file keys, the new status enum, the `contacted` migration, and the partial unique application index.
- `backend/src/storage.ts` — image sniffing and bucket put, get, and delete.
- `backend/src/auth.ts` — `provisionVolunteer` creates a volunteer with a random password, or returns an existing volunteer without a password.
- `backend/src/content.ts` — `coverUrl` on content JSON. `POST`, `GET`, and `DELETE /admin/content/:id/cover`. `GET /content/:id/cover` only when published. Deleting content deletes its cover.
- `backend/src/opportunities.ts` — admin list, create, and patch. Public `GET /opportunities` returns `id`, `title`, `location`, and `closingDate` for public open rows.
- `backend/src/applications.ts` — public `POST /applications`. Admin list, get, status patch, and `GET /admin/applications/:id/files/:index`. Accept returns `volunteer`, `password`, and `work`.
- `backend/src/index.ts` — mounts `/opportunities`, `/applications`, `/admin/opportunities`, and `/admin/applications`.
