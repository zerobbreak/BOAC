# Railway deploy from zerobbreak/BOAC

## Exact process

1. Confirmed the BOAC service (`0f21ef45-740e-48eb-a218-a1f3645880b1`) in project just-truth, environment production (`be1f4dce-6a53-4f3d-af78-c29027853230`), already had one GitHub deployment trigger (`8eb04eb0-1985-43b7-81ac-9eab6579d280`): repository `zerobbreak/BOAC`, branch `main`, provider `github`. The service root directory, build command, and start command were unset. Builder was `RAILPACK`.
2. Checked `git ls-remote git@github.com:zerobbreak/BOAC.git`. Only `refs/heads/main` (`3520ccdc187b8a65567d128acf965978b15cdb88`) exists. `feature-backend` is not on that repository yet.
3. Updated the service instance with `serviceInstanceUpdate`: `rootDirectory` `/backend`, `buildCommand` `npm run build`, `startCommand` `npm start`.
4. Updated the deployment trigger with `deploymentTriggerUpdate`: `branch` `feature-backend`. An earlier update that also sent `rootDirectory` on the trigger returned "Problem processing request" and was not applied.
5. Read the trigger and service instance back. Branch is `feature-backend`, repository `zerobbreak/BOAC`, root directory `/backend`, build `npm run build`, start `npm start`.
6. Locally, `backend/src/index.ts` now listens on `process.env.PORT` or `3000`, and `backend/railway.toml` sets the Railpack build and `npm start`. Those files are not committed or pushed.

## Work done

- Pushes of `feature-backend` to `zerobbreak/BOAC` are what Railway deploys for the BOAC service. It builds and starts from the `backend` folder.
- `feature-backend` is still only local, so Railway has not deployed it. The current live deployment remains the previous `main` deployment until that branch is pushed.
- `origin` still pushes to both `EMGPMD/insy7315-2026-task-2-group-4` and `zerobbreak/BOAC`.
- The port change and `backend/railway.toml` stay in the working tree until they are committed and pushed.
