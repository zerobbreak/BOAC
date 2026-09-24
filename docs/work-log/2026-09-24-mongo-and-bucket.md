# MongoDB and bucket clients

## Exact process

1. Confirmed project **just-truth**, environment **production**. The database service is **MongoDB** (`mongo:8.0`, service `0b3beda3-3607-4441-9475-68da5bfa1d44`). `MONGO_URL` points at `mongodb.railway.internal:27017`. Bucket **boac-uploads** (`ca679fdb-52e0-4fca-bc2b-8aff68e49a38`) is in region `ams`. Drizzle was not used, because the chosen setup is the MongoDB driver plus an S3 client.
2. `railway tcp-proxy list --service MongoDB --json` returned no proxies. Created one with `railway tcp-proxy create --port 27017 --service MongoDB --json`. It came back committed and `ACTIVE`.
3. Installed `mongodb`, `@aws-sdk/client-s3`, and `dotenv` in `backend`.
4. Added `backend/src/db.ts`, `backend/src/bucket.ts`, a `GET /health` route in `backend/src/index.ts`, and `backend/.env.example`.
5. Wrote `backend/.env` from the MongoDB service variables and `railway bucket credentials --bucket boac-uploads`. The file is gitignored. Credentials were not copied into this log.
6. Ran `npm run dev` in `backend`. `curl.exe http://localhost:3000/health` returned `{"database":true,"bucket":true}` with HTTP 200. The dev server was left running on port 3000.

## Work done

- Public TCP proxy `aa0b0e1b-cd21-477e-bab7-3c01cae5a04c` for MongoDB application port `27017`. Endpoint `iriguchi.proxy.rlwy.net:24835`, status `ACTIVE`.
- `backend/.env` holds `MONGODB_URI` (that proxy, `authSource=admin`), `MONGODB_DB=boac`, and the AWS SDK bucket variables. Endpoint used: `https://t3.storageapi.dev`. Region: `auto`.
- `getDb()` uses database `boac`. The Mongo client uses driver pool defaults. `pingDatabase()` runs `{ ping: 1 }`.
- `getBucket()` is an `S3Client` for `AWS_S3_BUCKET_NAME`. `pingBucket()` sends `HeadBucket`. Checksums are `WHEN_REQUIRED` so the Railway bucket accepts the request.
- `GET /health` reports `database` and `bucket`. Both were true after the check.
