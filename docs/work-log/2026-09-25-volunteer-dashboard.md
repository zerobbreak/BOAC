# Volunteer dashboard

## Exact process

1. [Volunteer workspace research](1e924f33-5459-4c2a-a2be-f9fac612add9) wrote `docs/research/2026-09-25-volunteer-dashboard-workspaces.md` from CiviVolunteer, Golden, VolunteerHub, Better Impact, Volunteers for Salesforce, and SignUpGenius official docs.
2. Read that note and `backend/src/volunteer-work.ts`. The only volunteer route was `GET/POST/PATCH /volunteer/work`, with no start time, hours, location, or profile.
3. Added optional `startsAt` and `hours` on `volunteer_work` in `backend/src/schema.ts`, plus an index on `volunteerId` + `startsAt`.
4. Added `GET /volunteer/dashboard` in `backend/src/volunteer-work.ts`. It returns the session profile, an upcoming/finished schedule, and the same rows grouped by opportunity location. `PATCH /volunteer/work/:id` accepts `hours`.
5. Added `POST /admin/assignments` in `backend/src/assignments.ts` and mounted it from `backend/src/index.ts`. An admin assigns a volunteer user to an opportunity, with an optional start time. The work title is the opportunity title. The location stays on the opportunity.
6. `npm exec tsc -- --noEmit` from `backend` exited 0. `backend/.env` is still missing, so the routes were not called over HTTP.

## Reasoning

- **The dashboard is a personal schedule, not a roster.** Golden My Opportunities, VolunteerHub My Schedule, Better Impact Schedule, Salesforce Scheduled Volunteer Shifts, and SignUpGenius Signed Up are that volunteer’s rows. `GET /volunteer/dashboard` loads only `volunteerId` equal to the session user.
- **The space is the opportunity location.** CiviVolunteer puts the address on the project. Golden, VolunteerHub, and Volunteers for Salesforce put it on the opportunity, job, or event. Better Impact says a shift cannot hold a location. The dashboard groups assignments by `opportunities.location`, then the opportunity title, then `Unassigned`. No new space collection.
- **The shift time is the smallest gap the note names.** `startsAt` is optional on the work row. Admin assignment sets it. The volunteer does not change it. Upcoming rows are those not `done`, earliest `startsAt` first.
- **Hours are a number on the same row, not a second system.** Golden, VolunteerHub, Better Impact, and Volunteers for Salesforce let the volunteer record hours on their own work. CiviVolunteer’s current book keeps Log Hours as staff, and SignUpGenius’s cited help has no hours page. The volunteer sets `hours` on their own row. Check-in codes were left out because those three products do not share one check-in action.
- **Profile is the session user.** Golden, Better Impact, and the Salesforce personal site put contact details beside the schedule. The payload uses `id`, `name`, `email`, and `role` from the Better Auth session.

## Work done

- `docs/research/2026-09-25-volunteer-dashboard-workspaces.md` — the source note for the five areas.
- `backend/src/schema.ts` — `volunteer_work.startsAt` and `volunteer_work.hours` (zero or more). Index `volunteerId` + `startsAt`.
- `backend/src/volunteer-work.ts` — `GET /volunteer/dashboard` returns `profile`, `schedule.upcoming`, `schedule.finished`, and `spaces`. Each assignment includes `location`, `opportunityTitle`, `startsAt`, and `hours`. `PATCH /volunteer/work/:id` can set `hours`.
- `backend/src/assignments.ts` — `POST /admin/assignments` with `volunteerId`, `opportunityId`, and optional `startsAt`. The user must already have role `volunteer`.
- `backend/src/index.ts` — mounts the assignment router at `/admin/assignments`.
