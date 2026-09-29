# Connect api to MongoDB and the bucket

## Exact process

1. Listed variable names on services `api` and `MongoDB` in project just-truth, production. `api` had only Railway system variables. `MongoDB` had `MONGO_URL`, `MONGOHOST`, `MONGOPORT`, `MONGOUSER`, and `MONGOPASSWORD`. No variable on `api` referenced another resource, so the canvas had no connection lines.
2. Set reference variables on `api` in one command: `railway variable set --service api` with `MONGO_URL=${{MongoDB.MONGO_URL}}`, `AWS_S3_BUCKET_NAME=${{boac-uploads.BUCKET}}`, `AWS_ENDPOINT_URL=${{boac-uploads.ENDPOINT}}`, `AWS_ACCESS_KEY_ID=${{boac-uploads.ACCESS_KEY_ID}}`, `AWS_SECRET_ACCESS_KEY=${{boac-uploads.SECRET_ACCESS_KEY}}`, and `AWS_DEFAULT_REGION=${{boac-uploads.REGION}}`.
3. That variable change started deployment `93e69e04-c9dc-48da-8c65-08e66b4cc837`. It finished with status `SUCCESS`, root directory `/backend`.
4. Requested `https://boac-production.up.railway.app/health`. The response was HTTP 200 and `{"database":true,"bucket":true}`.

## Work done

- `api` is connected to `MongoDB` through `MONGO_URL`, which references `MongoDB.MONGO_URL`.
- `api` is connected to bucket `boac-uploads` through `AWS_S3_BUCKET_NAME`, `AWS_ENDPOINT_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_DEFAULT_REGION`, each referencing the matching bucket variable (`BUCKET`, `ENDPOINT`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`, `REGION`).
- Those references are what Railway draws as lines on the project canvas.
- The live health check reports both the database and the bucket as reachable. Secret values were not copied into this file.
