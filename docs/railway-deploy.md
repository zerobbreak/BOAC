# Deploying BOAC on Railway

One Railway project, four pieces:

| Service | Source | What it is |
|---|---|---|
| `BOAC` (api) | GitHub `zerobbreak/BOAC`, Root Directory `/backend` | Hono + Better Auth backend (Railpack, `npm run build` / `npm start`) |
| `web` | GitHub `zerobbreak/BOAC`, Root Directory `/` | React build served by Caddy (`frontend/Dockerfile`) |
| `MongoDB` | Railway template | Database |
| `arranged-larder` | Railway bucket | Image and file storage |

The browser only talks to `web`. Caddy forwards `https://<web>/_api/*` to `api`, so the Better Auth session cookie
belongs to the frontend's own domain. Third-party cookie blocking can't break sign-in this way.

## 1. `api` service (backend)

Settings:

- Source repo `zerobbreak/BOAC`, branch `main`
- Root Directory: `/backend` (Railway then reads `backend/railway.toml` by itself)
- Networking: **Generate Domain**

Variables (`${{...}}` are Railway reference variables, so type them as-is):

```
MONGO_URL=${{MongoDB.MONGO_URL}}
MONGODB_DB=boac
AWS_S3_BUCKET_NAME=${{arranged-larder.BUCKET}}
AWS_ENDPOINT_URL=${{arranged-larder.ENDPOINT}}
AWS_ACCESS_KEY_ID=${{arranged-larder.ACCESS_KEY_ID}}
AWS_SECRET_ACCESS_KEY=${{arranged-larder.SECRET_ACCESS_KEY}}
AWS_DEFAULT_REGION=${{arranged-larder.REGION}}
BETTER_AUTH_SECRET=<32+ random characters>
BETTER_AUTH_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
FRONTEND_ORIGIN=https://${{web.RAILWAY_PUBLIC_DOMAIN}}
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
VOLUNTEER_EMAIL=...
VOLUNTEER_PASSWORD=...
```

Do not set `PORT`. Railway injects it and `src/index.ts` listens on it.

Check: `https://<api domain>/health` should return `{"database":true,"bucket":true}`.

## 2. `web` service (frontend)

Settings:

- Source repo `zerobbreak/BOAC`, branch `main`
- Root Directory: `/` (leave empty). The Dockerfile copies `backend/src` for the typed API client.
- Healthcheck Path: `/`
- Networking: **Generate Domain**

Railway no longer accepts a new Config File Path (it treats `railway.toml` as deprecated config-as-code), so
`frontend/railway.toml` is only a record of the intended settings. The builder is picked through a variable instead.

Variables:

```
RAILWAY_DOCKERFILE_PATH=frontend/Dockerfile
VITE_API_URL=/_api
API_UPSTREAM=https://${{BOAC.RAILWAY_PUBLIC_DOMAIN}}
```

On Windows Git Bash, run `railway variable set` with `MSYS_NO_PATHCONV=1`, or `/_api` gets rewritten into a Windows path.

- `VITE_API_URL` is a build arg. It gets baked into the JS bundle, so changing it needs a redeploy.
- `API_UPSTREAM` is read by Caddy at runtime. It has to be the full `https://` URL of `api`.

Check: open `https://<web domain>`, sign in at `/login`, and confirm the admin desk loads data.

## 3. Deploy triggers

Both services deploy on push to `main`. Each `railway.toml` has `watchPatterns`, so a frontend-only change
doesn't redeploy `api`, and a backend-only change only redeploys `web` when `backend/src` changes.

## Troubleshooting

- **Login returns 403 / "Invalid origin"**: `FRONTEND_ORIGIN` on `api` doesn't match the `web` URL exactly (`https://`, no trailing slash).
- **`/_api/...` gives 502 or "Application not found"**: `API_UPSTREAM` is wrong, or `api` has no public domain.
- **Frontend calls `localhost:3000`**: `VITE_API_URL` wasn't set when `web` was built. Set it and redeploy.
- **Healthcheck fails on `api`**: check the logs for `Set MONGODB_URI or MONGO_URL`, which means the Mongo reference variable is missing.
