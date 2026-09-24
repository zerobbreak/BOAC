# MongoDB content and volunteer schema

## Exact process

1. Mapped the agreed model onto MongoDB in database `boac`: one `content` collection with a `type` field, permissions embedded on `roles`, and `volunteer_applications` referencing `opportunities` instead of embedding an unbounded list.
2. Added `backend/src/schema.ts` with JSON Schema validators, indexes, and seed roles, plus `backend/src/setup-db.ts` and the `db:setup` script.
3. Ran `npm run db:setup` from `backend`. It connected with the existing `MONGODB_URI` and printed `Database schema is ready`.
4. Listed the collections and indexes, read the three role documents, and inserted a content document that omitted required fields. The insert was rejected.

## Work done

- Collections in `boac`: `roles`, `users`, `categories`, `tags`, `content`, `opportunities`, `volunteer_applications`. Each has strict JSON Schema validation.
- `content.type` is `post` or `article`. `content.status` is `draft` or `published`. Articles can set `categoryId` and up to 20 `tagIds`.
- `opportunities.status` is `open` or `closed`, with a `public` boolean. Applications require `opportunityId` and use status `submitted`, `under_review`, or `contacted`. `internalNotes` and `reviewedBy` are optional.
- Unique indexes: `roles.name`, `users.email`, `categories.name`, `tags.name`.
- Other indexes: `content` on `status+type`, `status+categoryId`, `tagIds`, and `authorId`; `opportunities` on `public+status`; `volunteer_applications` on `opportunityId` and `status`.
- Seeded roles: `admin` (all five permissions), `editor` (`manage_content`, `publish_content`), `reviewer` (`manage_opportunities`, `review_applications`).
- An incomplete `content` insert was rejected by validation. No user accounts were created.
