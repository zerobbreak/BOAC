# Railway MongoDB and uploads bucket

## Exact process

1. Confirmed the Railway CLI was installed (`railway` 5.52.1) and that this machine was logged in as Unathi Tshuma (`uthacker244@outlook.com`).
2. Ran `railway status` on the linked project. It was **just-truth** (`e77f92e9-c2e5-4d6a-aa8f-bec630012ac6`), environment **production** (`be1f4dce-6a53-4f3d-af78-c29027853230`). The only service was **BOAC** (`0f21ef45-740e-48eb-a218-a1f3645880b1`), online at https://boac-production.up.railway.app, region EU West, repo `zerobbreak/BOAC`. No database or bucket existed. `railway bucket list --json` returned `[]`.
3. Added MongoDB because this workspace is a MERN project: `railway add --database mongo --json`.
4. Created an object-storage bucket in EU West, the same region as BOAC: `railway bucket create boac-uploads --region ams --json`.
5. Verified with `railway status` and `railway bucket info --bucket boac-uploads --json`. MongoDB was online. The bucket was committed, empty, and in region `ams`.

## Work done

- Project **just-truth**, environment **production**, now has a **MongoDB** service (`0b3beda3-3607-4441-9475-68da5bfa1d44`, template `da83a76e-97f0-43c6-a342-e48a39293f48`). Status after setup: online, volume `mongodb-volume`.
- Bucket **boac-uploads** (`ca679fdb-52e0-4fca-bc2b-8aff68e49a38`) is in region `ams` (EU West), environment production. After creation it had 0 objects and 0 B stored.
- The BOAC service stayed online at https://boac-production.up.railway.app. Connection variables and bucket credentials were left on Railway and were not copied into this file.
