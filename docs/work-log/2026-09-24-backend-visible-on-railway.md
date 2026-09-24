# Backend visible on Railway

## Exact process

1. Checked `railway status`. The BOAC service was still online on deployment `b7fd8f38-1e85-43e8-bc25-6475ef6a282d`, the 17 September `main` deploy of the old site. MongoDB and bucket `boac-uploads` were online. There was no separate backend service.
2. Checked `git ls-remote git@github.com:zerobbreak/BOAC.git`. Only `refs/heads/main` (`3520ccdc187b8a65567d128acf965978b15cdb88`) existed. Railway was already set to deploy `feature-backend` from `/backend`, so it had nothing new to build.
3. Committed the local deploy fixes on `feature-backend` as `6fbaf7d`: `backend/src/index.ts` listens on `process.env.PORT` or `3000`, and `backend/railway.toml` sets the Railpack build and `npm start`.
4. Pushed with `git push -u origin feature-backend`. That updated `EMGPMD/insy7315-2026-task-2-group-4` and created `feature-backend` on `zerobbreak/BOAC`.
5. Railway started deployment `ccc22934-c1d0-49dd-b863-5dfc7bc3a73a` from that commit, root directory `/backend`, build `npm run build`, start `npm start`. Build logs showed Node 24.21.0, `npm install`, and `tsc`. Status became `SUCCESS`.
6. Requested `https://boac-production.up.railway.app/`. The response was HTTP 200 and body `Hello Hono!`.

## Work done

- The BOAC service on project just-truth is the backend. It is not a second service. URL: https://boac-production.up.railway.app
- Active deployment `ccc22934-c1d0-49dd-b863-5dfc7bc3a73a` is commit `6fbaf7d` on `zerobbreak/BOAC` branch `feature-backend`, root directory `/backend`.
- `GET /` returns `Hello Hono!`.
- `feature-backend` tracks `origin/feature-backend` and exists on both GitHub remotes.
- `docs/work-log/2026-09-24-railway-github-deploy.md` is still untracked.
