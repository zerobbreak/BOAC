```
# Backend API

This service powers the volunteer platform’s data and auth layer. It exposes the public website APIs, a protected admin API, and a volunteer-only dashboard API backed by MongoDB and S3-compatible object storage.

## Service responsibilities

- Auth and role handling with Better Auth
- MongoDB persistence for content, applications, assignments, messages, and volunteer work
- S3-compatible file storage for uploaded application and media assets
- Public API endpoints for programmes, contact, and opportunities
- Admin-only routes for managing content and reviewing applications
- Volunteer dashboard access for assigned work items and schedule summaries

## Environment

Create a `.env` file in this folder with the required values before running the API:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000

MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=boac

AWS_ENDPOINT_URL=https://your-s3-endpoint
AWS_DEFAULT_REGION=auto
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!

VOLUNTEER_EMAIL=volunteer@example.com
VOLUNTEER_PASSWORD=ChangeMe123!
```

## Start locally

```bash
npm install
npm run dev
```

The API is served at `http://localhost:3000` and includes a `/health` endpoint for checking MongoDB and S3 connectivity.

## Auth and roles

- `POST/GET /api/auth/*` is handled by Better Auth.
- Email/password sign-in is enabled, but sign-up is disabled.
- `requireAdmin` protects admin routes for users with the `admin` role.
- `requireVolunteer` protects volunteer dashboard routes for users with the `volunteer` role.
- `requireStaff('manage_content')` and `requireStaff('publish_content')` allow staff workflows around content publishing.
- Default admin and volunteer accounts are created automatically when `ADMIN_EMAIL` / `ADMIN_PASSWORD` and `VOLUNTEER_EMAIL` / `VOLUNTEER_PASSWORD` are present.

## Route reference

### Public routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/` | Returns a simple service health text response. |
| `GET` | `/health` | Checks MongoDB and bucket connectivity. |
| `GET` | `/opportunities` | Lists public, open opportunities. |
| `POST` | `/applications` | Submits a volunteer application form and uploads up to 3 image attachments. |
| `POST` | `/contact` | Submits a contact message. |
| `GET` | `/content` | Lists published public content, optionally filtered by `type`, `categoryId`, or `tagId`. |
| `GET` | `/content/:id` | Fetches a published content item by ID. |
| `GET` | `/content/:id/cover` | Returns the cover image for a published content item. |
| `GET` | `/categories` | Lists available content categories. |
| `GET` | `/tags` | Lists available tags. |

### Admin routes

All routes under `/admin/*` require an authenticated admin user.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/admin` | Returns a simple admin auth check payload. |
| `GET` | `/admin/content` | Lists content for dashboard filtering by `status` or `type`. |
| `POST` | `/admin/content` | Creates content drafts or publishes content if the user has publish permission. |
| `PATCH` | `/admin/content/:id` | Updates a content item. |
| `POST` | `/admin/content/:id/cover` | Uploads a cover image. |
| `GET` | `/admin/content/:id/cover` | Returns a cover image. |
| `DELETE` | `/admin/content/:id/cover` | Removes a cover image. |
| `DELETE` | `/admin/content/:id` | Deletes a content item and its cover file. |
| `GET` | `/admin/categories` | Lists categories. |
| `POST` | `/admin/categories` | Creates a category. |
| `PATCH` | `/admin/categories/:id` | Updates a category. |
| `DELETE` | `/admin/categories/:id` | Deletes a category. |
| `GET` | `/admin/tags` | Lists tags. |
| `POST` | `/admin/tags` | Creates a tag. |
| `PATCH` | `/admin/tags/:id` | Updates a tag. |
| `DELETE` | `/admin/tags/:id` | Deletes a tag. |
| `GET` | `/admin/opportunities` | Lists all opportunities. |
| `POST` | `/admin/opportunities` | Creates an opportunity. |
| `PATCH` | `/admin/opportunities/:id` | Updates an opportunity. |
| `GET` | `/admin/applications` | Lists applications, optionally filtered by `status`. |
| `GET` | `/admin/applications/:id` | Fetches a single application. |
| `GET` | `/admin/applications/:id/files/:index` | Returns an uploaded application image. |
| `PATCH` | `/admin/applications/:id` | Reviews and changes an application status. |
| `GET` | `/admin/messages` | Lists contact messages. |
| `PATCH` | `/admin/messages/:id` | Marks a message as `new` or `handled`. |
| `POST` | `/admin/assignments` | Creates an assignment for a volunteer for a specific opportunity. |

### Volunteer routes

All routes under `/volunteer/*` require an authenticated volunteer user.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/volunteer/dashboard` | Returns the volunteer profile, upcoming work, finished work, and grouped spaces. |
| `GET` | `/volunteer/work` | Lists the current volunteer’s work items. |
| `POST` | `/volunteer/work` | Creates a new work item. |
| `PATCH` | `/volunteer/work/:id` | Updates a volunteer work item. |

## Notes for frontend integration

- The frontend client types are derived from the backend route tree in `src/index.ts` via `AppType`.
- Public routes are mounted without auth; admin and volunteer routes are protected by middleware.
- File upload endpoints return binary data as needed for images and media cover files.
- Validation is performed with Zod schemas for request bodies, query params, and route params.

## Typical workflow

1. Start MongoDB and the S3-compatible storage service.
2. Run the backend with `npm run dev`.
3. Sign in through the Better Auth flows exposed under `/api/auth/*`.
4. Use the admin and volunteer routes to manage content, review applications, and track assignments.
