# Volunteer self-service workspaces after assignment

**Date:** 2026-09-25

Research notes from official documentation and first-party source labels: after a volunteer is accepted and assigned, which named areas a signed-in volunteer uses, whether those areas show only that volunteer’s work, whether location or shift sits on the assignment, and what the volunteer may change. Claims cite the owning primary source. Where a source is silent, that gap is stated. Rosterfy’s own handbook was not retrieved, so it is not used below.

This project’s model, as implemented, is `volunteer_work` (`title`, `status` `planned` | `in_progress` | `done`, optional `notes`, optional `opportunityId`, `volunteerId`) and `opportunities` (`title`, optional `location`, `status` `open` | `closed`, `public`, optional `closingDate`).

---

## 1. CiviVolunteer (CiviCRM)

Official book: [Introduction](https://docs.civicrm.org/volunteer/en/latest/), [Projects](https://docs.civicrm.org/volunteer/en/latest/projects/), [Opportunities](https://docs.civicrm.org/volunteer/en/latest/opportunities/), [Assignments](https://docs.civicrm.org/volunteer/en/latest/assignments/), [Sign up form](https://docs.civicrm.org/volunteer/en/latest/sign-up-form/), [Logging hours](https://docs.civicrm.org/volunteer/en/latest/logging-hours/).

### Named areas

The handbook does **not** name a signed-in volunteer dashboard of “my assignments,” “my shifts,” or “my hours.” Surfaces it does name:

- **Sign-up form** (including a project page’s **“Volunteer Now”** button). Volunteers “sign up for specific opportunities themselves” ([Introduction](https://docs.civicrm.org/volunteer/en/latest/); [Sign up form](https://docs.civicrm.org/volunteer/en/latest/sign-up-form/)).
- Staff menus: **Volunteers > Manage Volunteer Projects**, then **Assign Volunteers**, **View Volunteer Roster**, or **Log Hours** ([Assignments](https://docs.civicrm.org/volunteer/en/latest/assignments/); [Logging hours](https://docs.civicrm.org/volunteer/en/latest/logging-hours/)).
- **Activities** tab on a contact: “Assignments are activities, and thus are viewable within the Activities tab for each contact” ([Assignments](https://docs.civicrm.org/volunteer/en/latest/assignments/)). The page describes this as CRM storage and staff search, not as a volunteer portal.

**Future plans** lists “self-service logging of volunteer hours” as work still on the drawing board for phase 2 ([Introduction](https://docs.civicrm.org/volunteer/en/latest/)).

### Only their assignments, or everyone’s?

The main sign-up form “will offer all opportunities to volunteers, even if they are defined within separate projects.” A project-specific form offers that project’s opportunities ([Sign up form](https://docs.civicrm.org/volunteer/en/latest/sign-up-form/)). **View Volunteer Roster** is “a summary of all the volunteers signed up for opportunities within a given project” ([Assignments](https://docs.civicrm.org/volunteer/en/latest/assignments/)). The docs do not describe a permission that limits a volunteer to their own assignment rows.

### Location, shift, or space on the assignment?

- An assignment “links a CiviCRM contact to a specific volunteering opportunity” ([Assignments](https://docs.civicrm.org/volunteer/en/latest/assignments/)). The assignment page does not list location, shift, or space as columns on that link.
- **Shift** is a schedule type of the **opportunity**: **Set Shift** (start time and duration), **Flexible Timeframe**, or **Open-Ended** ([Opportunities](https://docs.civicrm.org/volunteer/en/latest/opportunities/)). Signup may select **“Any”** as the shift, which only puts the person on the **Available Volunteers** list until staff place them ([Assignments](https://docs.civicrm.org/volunteer/en/latest/assignments/)).
- **Location** is a characteristic of the **project**: “the physical location (as an address) where the volunteering will take place” ([Projects](https://docs.civicrm.org/volunteer/en/latest/projects/)). It is not listed among opportunity characteristics.

### What the volunteer can change

Self-service documented for the volunteer is signup, which creates an assignment ([Sign up form](https://docs.civicrm.org/volunteer/en/latest/sign-up-form/); [Assignments](https://docs.civicrm.org/volunteer/en/latest/assignments/)). Removing an assignment (arrow, **Move to** or **Delete**) and **Log Hours** (**Actual Duration** and **Status**) are described as staff actions. Hours “are stored within the activity for the assignment” ([Logging hours](https://docs.civicrm.org/volunteer/en/latest/logging-hours/)). The logging page does not name the status values in that column. Commendations are staff-written and “don’t get emailed” ([same](https://docs.civicrm.org/volunteer/en/latest/logging-hours/)).

### Mapping

`volunteerId` + `opportunityId` matches “a contact linked to a specific opportunity.” `opportunities.location` can hold the project address the docs put on the project, so a separate project entity is not required to store that string. `opportunities.status` `open` | `closed` and `public` are not the same pair as opportunity **Public** and **Enabled**, or project active/inactive; the docs do not define those two labels.

**Smallest gap:** a Set Shift is a start time and duration on the opportunity ([Opportunities](https://docs.civicrm.org/volunteer/en/latest/opportunities/)). This model has `closingDate` on the opportunity and no start or duration on either collection. The handbook also does not provide a volunteer workspace whose hours the volunteer updates; **Actual Duration** is staff-entered and is not a field here.

---

## 2. Golden (official help center)

Volunteer-facing articles: [How do I access my participant profile?](https://support.goldenvolunteer.com/knowledge_base/how-do-i-access-my-volunteer-profile), [How to Log Service Hours](https://support.goldenvolunteer.com/knowledge_base/how-to-log-service-hours), [Navigating the Golden App](https://support.goldenvolunteer.com/knowledge_base/how-do-i-navigate-the-golden-app), [How to Use Automatic Check-In/Check-Out](https://support.goldenvolunteer.com/knowledge_base/how-does-the-app-automatically-track-my-hours), [How do I use Golden to manage our day-to-day schedule?](https://support.goldenvolunteer.com/knowledge_base/how-do-i-use-golden-to-manage-our-day-to-day-schedule), [Tracking Hours and Taking Attendance](https://support.goldenvolunteer.com/knowledge_base/how-can-i-track-hours-and-take-attendance). Organizer status list: [Participant Registration Statuses](https://support.goldenvolunteer.com/knowledge_base/what-are-the-different-registration-statuses-what-do-they-mean).

### Named areas

Signed-in **Participant Portal** / **Volunteer Portal**:

- **“Profile/Your Name”**, then **“My opportunities”** / **“My Opportunities”**: “upcoming, pending, and completed opportunities, as well as your lifetime hours” ([profile](https://support.goldenvolunteer.com/knowledge_base/how-do-i-access-my-volunteer-profile)). **“LOG HOURS”** is a button next to an opportunity on that page ([log hours](https://support.goldenvolunteer.com/knowledge_base/how-to-log-service-hours)).

Golden app tabs ([Navigating the Golden App](https://support.goldenvolunteer.com/knowledge_base/how-do-i-navigate-the-golden-app)):

- **Discover** — “find and sign up for volunteer opportunities.”
- **Activity** — “upcoming opportunities, opportunities you're pending for (waitlisted), and opportunities you've already completed.”
- **Account** — “profile and settings,” plus background check. The same page mentions **AI Coaching**; that is unrelated to assigned work.

Organizer **Dashboard** and **Opportunities** tab are staff views of everyone registered ([statuses](https://support.goldenvolunteer.com/knowledge_base/what-are-the-different-registration-statuses-what-do-they-mean)).

### Only their assignments, or everyone’s?

**My Opportunities** and the **Activity** tab are worded as the signed-in person’s upcoming, pending, and completed opportunities ([profile](https://support.goldenvolunteer.com/knowledge_base/how-do-i-access-my-volunteer-profile); [app](https://support.goldenvolunteer.com/knowledge_base/how-do-i-navigate-the-golden-app)). **Discover** is the catalog. The help articles do not say the Activity tab lists other people’s registrations. Organizer registration statuses are on the organizer Opportunity detail page, not described as volunteer-visible.

### Location, shift, or space on the assignment?

Automatic check-in applies when the volunteer registers for “an Opportunity with a physical location” / “an Opportunity with a location.” The app geofences that opportunity location ([automatic check-in](https://support.goldenvolunteer.com/knowledge_base/how-does-the-app-automatically-track-my-hours)). Organizer help treats **flexible opportunities** as one signup, then hours reported when the work is done ([day-to-day schedule](https://support.goldenvolunteer.com/knowledge_base/how-do-i-use-golden-to-manage-our-day-to-day-schedule)). These pages do not define a separate “space” field on the registration. They also do not say the registration row stores its own location distinct from the opportunity.

### What the volunteer can change

From the cited help: sign up (Discover), **LOG HOURS** on My Opportunities, automatic check-in and check-out when location services are on, and **Volunteer Self-Confirmation** of attendance when organizers have not confirmed or denied it (hours are then added) ([log hours](https://support.goldenvolunteer.com/knowledge_base/how-to-log-service-hours); [check-in](https://support.goldenvolunteer.com/knowledge_base/how-does-the-app-automatically-track-my-hours); [attendance](https://support.goldenvolunteer.com/knowledge_base/how-can-i-track-hours-and-take-attendance)). Organizer statuses include **Cancelled** “either by them or by an organizer” and **Missed** “either by themselves or the Dashboard” ([statuses](https://support.goldenvolunteer.com/knowledge_base/what-are-the-different-registration-statuses-what-do-they-mean)). Kiosk check-in is described as the kiosk, and organizer attendance confirmation is the Dashboard. The status article does not say the volunteer edits the organizer status list directly.

### Mapping

One `volunteer_work` row per opportunity can stand in for “my upcoming / pending / completed” only by overloading `planned` | `in_progress` | `done`. Golden’s **LOG HOURS** and lifetime hours are a quantity, not that enum. `opportunities.location` matches the opportunity’s physical location used for check-in.

**Smallest gap:** a numeric hours value on the work row. The pages do not require a new location or space field.

---

## 3. VolunteerHub (vendor support)

[Volunteer Check-In Code](https://support.volunteerhub.com/support/solutions/articles/60000681133-volunteer-check-in-code), [remote / work-from-home opportunities](https://support.volunteerhub.com/support/solutions/articles/60000610929-what-s-the-best-way-to-manage-remote-or-work-from-home-opportunities-), [Ad-Hoc Hours](https://support.volunteerhub.com/support/solutions/articles/60001049026-ad-hoc-hours), [Volunteer View filter](https://support.volunteerhub.com/support/solutions/articles/60000703403-how-do-i-edit-the-dropdown-filter-on-volunteer-view-), [manually register a user](https://support.volunteerhub.com/support/solutions/articles/60000610973-how-do-i-manually-register-a-user-for-more-than-one-event-), [OnSite](https://support.volunteerhub.com/support/solutions/articles/60000610961-onsite), [Custom Reports](https://support.volunteerhub.com/support/solutions/articles/60000715666-custom-reports), [Going Live](https://support.volunteerhub.com/support/solutions/articles/60000610920-10-going-live-with-volunteerhub-).

### Named areas

- **Volunteer View**: a schedule volunteers browse, with an **Event Groups** drop-down ([Volunteer View](https://support.volunteerhub.com/support/solutions/articles/60000703403-how-do-i-edit-the-dropdown-filter-on-volunteer-view-)).
- **My Schedule**: after registration, the volunteer opens the organization’s page, clicks **My Schedule**, locates the **Event**, and may click **Check In** or **Check Out** ([Check-In Code](https://support.volunteerhub.com/support/solutions/articles/60000681133-volunteer-check-in-code)). After an admin registers someone, the admin is told to “advise the volunteer to view their schedule” ([manual registration](https://support.volunteerhub.com/support/solutions/articles/60000610973-how-do-i-manually-register-a-user-for-more-than-one-event-)).
- **My Hours** on “the volunteer's profile (in the Volunteer View)”: a **Report Hours** button when **Hours Self-Reporting** is **Allowed** for an event the volunteer is signed up for ([remote hours](https://support.volunteerhub.com/support/solutions/articles/60000610929-what-s-the-best-way-to-manage-remote-or-work-from-home-opportunities-)).
- **View Hours**: **Report Hours**, including **Other** for ad-hoc hours not tied to an event ([Ad-Hoc Hours](https://support.volunteerhub.com/support/solutions/articles/60001049026-ad-hoc-hours)).

**OnSite** (Users, Events, check-in all) and **Approve Hours** are administrator screens ([OnSite](https://support.volunteerhub.com/support/solutions/articles/60000610961-onsite); [remote hours](https://support.volunteerhub.com/support/solutions/articles/60000610929-what-s-the-best-way-to-manage-remote-or-work-from-home-opportunities-)).

### Only their assignments, or everyone’s?

**Volunteer View** is a browseable schedule of upcoming events, optionally limited by landing page and event group, not described as “only events I joined” ([Volunteer View](https://support.volunteerhub.com/support/solutions/articles/60000703403-how-do-i-edit-the-dropdown-filter-on-volunteer-view-)). **My Schedule** is where a registered volunteer finds the event in order to check in; the check-in article does not say that list includes other people’s registrations. **Report Hours** appears on My Hours “whenever the volunteer is signed up for that event” ([remote hours](https://support.volunteerhub.com/support/solutions/articles/60000610929-what-s-the-best-way-to-manage-remote-or-work-from-home-opportunities-)). **History** on a user profile (staff OnSite) lists “all the dates, events and volunteer hours for the volunteer” ([OnSite](https://support.volunteerhub.com/support/solutions/articles/60000610961-onsite)).

### Location, shift, or space on the assignment?

Custom reports expose **Location** and **“Location of the Event”** with event start/end, not as a column the support articles place on the registration row ([Custom Reports](https://support.volunteerhub.com/support/solutions/articles/60000715666-custom-reports)). Going-live guidance says to create **Event Groups** “for every opportunity type and/or location,” and separate **landing pages** when opportunities are in multiple places ([Going Live](https://support.volunteerhub.com/support/solutions/articles/60000610920-10-going-live-with-volunteerhub-)). The articles consulted do not name a “space” field on the volunteer’s registration.

### What the volunteer can change

**Check In** (enter the day’s 6-digit code) and **Check Out** on My Schedule, only if Check-In Code is enabled; it “is turned off by default” and requires Kiosk ([Check-In Code](https://support.volunteerhub.com/support/solutions/articles/60000681133-volunteer-check-in-code)). **Report Hours** / ad-hoc **Report Hours** submit a date, hours, and (for ad hoc) a comment; an administrator **Approve**s or **Decline**s on **Approve Hours**. Self-reporting is **Not allowed** until an admin sets **Hours Self-Reporting** to **Allowed**. Hours “may only be submitted once per event” unless an admin later marks them unapproved ([remote hours](https://support.volunteerhub.com/support/solutions/articles/60000610929-what-s-the-best-way-to-manage-remote-or-work-from-home-opportunities-); [Ad-Hoc Hours](https://support.volunteerhub.com/support/solutions/articles/60001049026-ad-hoc-hours)). OnSite check-in of other people is staff.

### Mapping

An event maps to an opportunity (`title`, and `location` for “Location of the Event”). A registration maps to `volunteer_work` (`volunteerId`, `opportunityId`). `status` `planned` | `in_progress` | `done` is not the check-in code flow, and it does not store the hours number an admin must approve.

**Smallest gap:** a numeric hours value on the work row (the thing **Report Hours** submits). Event start/end is documented on the event in reports, and this opportunity has `closingDate` rather than a start. That is a second, separate gap if the schedule must show when the event is. Location does not require a new field.

---

## 4. Better Impact (MyImpactPage)

[Comprehensive Guide to Scheduling](https://support.betterimpact.com/en/articles/13192494-comprehensive-guide-to-scheduling), [Comprehensive Guide to Activities](https://support.betterimpact.com/en/articles/8780736-comprehensive-guide-to-activities), [Comprehensive Guide to Hours](https://support.betterimpact.com/en/articles/13160139-comprehensive-guide-to-hours), [How can I tell if a volunteer can see a specific Activity?](https://support.betterimpact.com/en/articles/9824462-how-can-i-tell-if-a-volunteer-can-see-a-specific-activity), [March 2023 – 4x.6 Update](https://support.betterimpact.com/en/articles/9891773-march-2023-4x-6-update).

### Named areas

Volunteer site labels in these articles:

- **OPPORTUNITIES** tab on MyImpactPage.com, with filters **Qualified**, **Generally Available**, **Signed Up**, **Scheduled**, **Backup List** ([visibility](https://support.betterimpact.com/en/articles/9824462-how-can-i-tell-if-a-volunteer-can-see-a-specific-activity)).
- **MyImpactPage > Schedule**: where the volunteer still needs to click **Confirm** next to their assignment when auto-confirm is off ([Scheduling](https://support.betterimpact.com/en/articles/13192494-comprehensive-guide-to-scheduling)).
- **HOURS** tab: pick an **Activity**, **Date Volunteered**, hours and minutes ([Hours](https://support.betterimpact.com/en/articles/13160139-comprehensive-guide-to-hours)).
- **MY PROFILE** tab, including the **Timeclock QR Code** section ([Hours](https://support.betterimpact.com/en/articles/13160139-comprehensive-guide-to-hours)).
- **Timeclock** (`timeclock.myimpactpage.com`, mobile **Home** with **Start Clock** / **Stop Clock**). On mobile, the volunteer sees “a list of the Activities they are assigned to” for which a clock can start ([Hours](https://support.betterimpact.com/en/articles/13160139-comprehensive-guide-to-hours)).

A subscribed calendar feed in “volunteer calendars” shows that volunteer’s assignments: 30 days of historical assignments and up to 90 days ahead ([March 2023 update](https://support.betterimpact.com/en/articles/9891773-march-2023-4x-6-update)).

### Only their assignments, or everyone’s?

**OPPORTUNITIES** shows activities the volunteer is allowed to see, not only rows already assigned to them. Filters include Signed Up and Scheduled ([visibility](https://support.betterimpact.com/en/articles/9824462-how-can-i-tell-if-a-volunteer-can-see-a-specific-activity)). **Schedule** confirmation is “next to their assignment” ([Scheduling](https://support.betterimpact.com/en/articles/13192494-comprehensive-guide-to-scheduling)). The calendar feed is “their calendar” of “assignments,” not a roster of every volunteer ([March 2023 update](https://support.betterimpact.com/en/articles/9891773-march-2023-4x-6-update)). The HOURS activity list can be **Recent** assignments, or **Active** / **Inactive** activities “that are visible to them,” so it is not limited to assigned shifts ([Hours](https://support.betterimpact.com/en/articles/13160139-comprehensive-guide-to-hours)). “Volunteers can only view or delete their own hours” ([same](https://support.betterimpact.com/en/articles/13160139-comprehensive-guide-to-hours)).

### Location, shift, or space on the assignment?

A **shift** is “a single occurrence of an activity, tied to a specific date and time.” “It's not possible to add a note to a shift, assign a leader or location.” Location-like detail “can also be added to the Activity Name or Description” ([Activities](https://support.betterimpact.com/en/articles/8780736-comprehensive-guide-to-activities)). An assignment places the volunteer “onto an activity or shift” ([Scheduling](https://support.betterimpact.com/en/articles/13192494-comprehensive-guide-to-scheduling)). Hours entries are separate: volunteer profile, activity, date, duration. “Scheduling and Hours are separate systems” ([Hours](https://support.betterimpact.com/en/articles/13160139-comprehensive-guide-to-hours)).

### What the volunteer can change

Signup expresses interest and does not by itself put them on the schedule. Assignment is self-scheduling or an administrator. **Confirm** is optional and, if auto-confirm is disabled, the volunteer must click it ([Scheduling](https://support.betterimpact.com/en/articles/13192494-comprehensive-guide-to-scheduling)). They can log hours, start and stop a timeclock, view their hours, and delete their own hours within 24 hours. They cannot edit hours once logged, delete them after 24 hours, or approve their own hours ([Hours](https://support.betterimpact.com/en/articles/13160139-comprehensive-guide-to-hours)).

### Mapping

`opportunities` matches an **Activity** (title; `public` is in the direction of visibility, but Better Impact’s visibility is status and qualifications, which these docs do not reduce to `open` | `closed`). `volunteer_work` can be the assignment only if it also knows which shift. `notes` is not a shift field the product has. Hours are another record, not `status`.

**Smallest gap:** a shift date/time on `volunteer_work`. The source refuses a location-on-shift field, so `opportunities.location` is already more structured than that handbook. Hours (a duration) are the next gap, because they are a second system.

---

## 5. Volunteers for Salesforce (Salesforce Help, Trailhead, package labels)

[Customize the Volunteer Job Listing Page](https://help.salesforce.com/s/articleView?id=sfdo.v4s_setup_customize_job_listings.htm&language=en_US&type=5) (Salesforce Help). Trailhead, [Other V4S Pages](https://trailhead.salesforce.com/content/learn/modules/nonprofit_volunteer_website/nonprofit_volunteer_website_pages). Package labels in [CustomLabels.labels](https://github.com/SalesforceFoundation/Volunteers-for-Salesforce/blob/master/src/labels/CustomLabels.labels) (`PersonalSiteContactInfo`, `VolunteersReportHours`). Signup creates **Volunteer Hours** related to the contact, job, and shift ([Sign Up Volunteers](https://trailhead.salesforce.com/content/learn/modules/nonprofit_volunteer_website/nonprofit_volunteer_website_volunteers)).

### Named areas

Trailhead’s table of site pages:

| Page label in Trailhead | What that page says it does |
| --- | --- |
| **Volunteer Jobs Listing** | Signup for a job or shift |
| **Calendar Page** | “Displays a calendar view of your volunteer jobs.” |
| **Report Hours Page** | “Volunteers can report their hours worked on a specific job.” |
| **Personal Site Contact Lookup** | Volunteer requests a link “to see all their volunteer information.” |
| **Personal Site Contact Info** | “Shows a volunteer their contact and volunteer information, their upcoming job shifts, and their volunteer history.” |

Source labels on Personal Site Contact Info: page purpose **“View your information”**; section **“Scheduled Volunteer Shifts”**; section **“Your Recent Volunteer History”**; columns include **Job**, **Date**, **Time**, **Hours** ([CustomLabels.labels](https://github.com/SalesforceFoundation/Volunteers-for-Salesforce/blob/master/src/labels/CustomLabels.labels)). Report Hours title is **“Report Hours”**. If the contact has no jobs to report against, the label is “There are no Jobs available for you to report hours against.” With shifts, help text is “Select the Shift you worked, and update the number of hours you worked if needed.” Without shifts: “Specify the time frame you are reporting on, and the total hours you worked.”

Staff **Volunteer Recurrence Schedule** sets **Volunteer Hours Status** to **Confirmed** or **Completed** in Salesforce Help’s staff procedure ([Sign Up a Recurring Volunteer](https://help.salesforce.com/s/articleView?id=sfdo.v4s_user_recurring_volunteer_vrs.htm&language=en_US&type=5)). That page is an administrator creating the schedule, not the personal site.

### Only their assignments, or everyone’s?

Personal Site Contact Info and the lookup are described as **their** shifts, history, and volunteer information ([Trailhead](https://trailhead.salesforce.com/content/learn/modules/nonprofit_volunteer_website/nonprofit_volunteer_website_pages)). The job listing is the catalog: it can show every active job and, optionally, “the number of volunteers confirmed and the number still available for each Shift” ([Job Listing](https://help.salesforce.com/s/articleView?id=sfdo.v4s_setup_customize_job_listings.htm&language=en_US&type=5)). The job calendar is a calendar of jobs, not documented as filtered to one contact. Upcoming shifts on the personal site are separate from completed hours: a first-party commit states the upcoming list “should avoid completed ones” ([commit 711eff7](https://github.com/SalesforceFoundation/Volunteers-for-Salesforce/commit/711eff75438b2707812f639334df0e6760c5689a)).

### Location, shift, or space on the assignment?

**Location address fields** and a **Location Information** field are on the **Volunteer Job**. The listing can **Show the Job's address**, **Show location details**, and **Show a map of the Job's location** ([Job Listing](https://help.salesforce.com/s/articleView?id=sfdo.v4s_setup_customize_job_listings.htm&language=en_US&type=5)). A **Shift** is its own record (listing parameter `volunteerShiftId`, shift date and time formats on that page). Trailhead’s signup check stores a **Volunteer Hours** row under the shift the volunteer chose ([Sign Up Volunteers](https://trailhead.salesforce.com/content/learn/modules/nonprofit_volunteer_website/nonprofit_volunteer_website_volunteers)). The personal-site labels show Date and Time on the volunteer’s shift table; the job-listing article does not put the address on the hours row.

### What the volunteer can change

The documented volunteer writes are signup (creates hours) and **Report Hours** (select the shift, or a time frame, and set hours worked) ([Trailhead](https://trailhead.salesforce.com/content/learn/modules/nonprofit_volunteer_website/nonprofit_volunteer_website_pages); [labels](https://github.com/SalesforceFoundation/Volunteers-for-Salesforce/blob/master/src/labels/CustomLabels.labels)). Setting Volunteer Hours status to Confirmed or Completed, and mass-editing hours, are described as staff ([recurrence help](https://help.salesforce.com/s/articleView?id=sfdo.v4s_user_recurring_volunteer_vrs.htm&language=en_US&type=5)). The personal-site sources consulted do not say the volunteer changes shift status or location.

### Mapping

`opportunities` matches a **Volunteer Job** (`title`, `location` for the job address / location information, `public` in the direction of **Display on Website** — the help text uses that flag, not `open` | `closed`). `volunteer_work.opportunityId` matches the job, not the shift. One job has many shifts.

**Smallest gap:** a shift start on `volunteer_work` (the hours row points at a shift). The hours number the volunteer types on Report Hours is the same kind of gap as Golden and VolunteerHub; it is not `status`.

---

## 6. SignUpGenius (official help center)

[Welcome to the New SignUpGenius Dashboard](https://support.signupgenius.com/hc/en-us/articles/40622691672471-Welcome-to-the-New-SignUpGenius-Dashboard), [How to Edit or Delete Your Sign Up Response](https://support.signupgenius.com/hc/en-us/articles/38740678483479-How-to-Edit-or-Delete-Your-Sign-Up-Response), [What Do Participants See?](https://support.signupgenius.com/hc/en-us/articles/38010992489879-What-Do-Participants-See), [Hide Names on Sign Ups](https://support.signupgenius.com/hc/en-us/articles/29465620945815-Hide-Names-on-Sign-Ups), [Adding Slots](https://support.signupgenius.com/hc/en-us/articles/36345883080727-Adding-Slots), [Edit a Participant's Sign Up Slot](https://support.signupgenius.com/hc/en-us/articles/29465712246039-Edit-a-Participant-s-Sign-Up-Slot).

### Named areas

Logged-in **Sign Ups** dashboard views: **Created**, **Invited To**, **Signed Up**, and **Archived**, plus **Calendar View** (“See your sign ups displayed on a calendar by date”) ([dashboard](https://support.signupgenius.com/hc/en-us/articles/40622691672471-Welcome-to-the-New-SignUpGenius-Dashboard)). For an account signup, **“Items I’ve Signed Up For”** on the dashboard: open the sign up and “edit, swap, or delete your slot” ([edit your response](https://support.signupgenius.com/hc/en-us/articles/38740678483479-How-to-Edit-or-Delete-Your-Sign-Up-Response)). On a multi-date sign up, participants get “one card per date instead of one per slot” and can use **Manage slots** or **Manage waitlist** ([dashboard](https://support.signupgenius.com/hc/en-us/articles/40622691672471-Welcome-to-the-New-SignUpGenius-Dashboard)).

The help articles consulted do not name an hours page or a profile of contact details separate from the slot response.

### Only their assignments, or everyone’s?

**Signed Up** / **Items I’ve Signed Up For** is the sign ups that person joined ([dashboard](https://support.signupgenius.com/hc/en-us/articles/40622691672471-Welcome-to-the-New-SignUpGenius-Dashboard); [edit your response](https://support.signupgenius.com/hc/en-us/articles/38740678483479-How-to-Edit-or-Delete-Your-Sign-Up-Response)). Opening a sign up is different: by default participants “see all past and future dates” and “the names and the public comment of any participants that have signed up.” They do not see other participants’ email, phone, or custom-question replies. Creators can hide names and comments; hidden slots then show **“Already Filled”** or filled-versus-total counts ([What Do Participants See?](https://support.signupgenius.com/hc/en-us/articles/38010992489879-What-Do-Participants-See); [Hide Names](https://support.signupgenius.com/hc/en-us/articles/29465620945815-Hide-Names-on-Sign-Ups)).

### Location, shift, or space on the assignment?

A **slot** has a title (“the item/task the participant is signing up for”), a **Help Comment**, a number of participants wanted, and dates/times the slot is assigned to ([Adding Slots](https://support.signupgenius.com/hc/en-us/articles/36345883080727-Adding-Slots)). Those pages do not name a location or space field on the slot. The date/time is the slot’s place in the schedule.

### What the volunteer can change

The participant edits, swaps, or deletes **their** slot, or uses **Manage slots** / **Manage waitlist** ([edit your response](https://support.signupgenius.com/hc/en-us/articles/38740678483479-How-to-Edit-or-Delete-Your-Sign-Up-Response); [dashboard](https://support.signupgenius.com/hc/en-us/articles/40622691672471-Welcome-to-the-New-SignUpGenius-Dashboard)). Changing someone else’s slot is **Tools > Edit People on Sign Ups** for the sign-up creator ([Edit a Participant's Sign Up Slot](https://support.signupgenius.com/hc/en-us/articles/29465712246039-Edit-a-Participant-s-Sign-Up-Slot)). Editing slot structure (title, quantity, dates) is the creator’s **Slots** tab ([Editing and Removing Slots](https://support.signupgenius.com/hc/en-us/articles/36226396162199-Editing-and-Removing-Slots)). No hours or check-in action appears in these articles.

### Mapping

The sign up maps to an opportunity. The participant’s slot maps to `volunteer_work` (`title` can hold the slot title; `volunteerId` whose slot it is). One opportunity with many dated slots cannot be told apart by `opportunityId` alone.

**Smallest gap:** the slot’s date/time on `volunteer_work`. These pages do not require a location field. They also do not support an hours or check-in workspace.

---

## Dashboard areas this evidence supports

1. **A personal schedule of this volunteer’s upcoming and finished assignments** — Golden **My Opportunities** and the app **Activity** tab, VolunteerHub **My Schedule**, Better Impact **Schedule** and the volunteer calendar feed, Volunteers for Salesforce **Scheduled Volunteer Shifts**, and SignUpGenius **Signed Up** / **Items I’ve Signed Up For**. CiviVolunteer’s book does not describe this area; it describes staff **Assign Volunteers**, **View Volunteer Roster**, and the contact **Activities** tab.

2. **The shift, slot, or event time they were assigned, shown on that schedule** — CiviVolunteer **Set Shift** on the opportunity, Better Impact’s shift as “a single occurrence of an activity, tied to a specific date and time,” Volunteers for Salesforce shift date/time on the personal site, VolunteerHub event start/end in reports, and SignUpGenius slot dates with **Manage slots**. This is the piece `volunteer_work` cannot store without a new date/time. Sources disagree on where location lives: CiviVolunteer puts an address on the **project**, Golden and Volunteers for Salesforce and VolunteerHub put it on the **opportunity / job / event**, Better Impact says a shift cannot be given a location and to put it in the activity name or description, and the SignUpGenius pages consulted do not mention location.

3. **Hours the volunteer records against their own work** — Golden **LOG HOURS**, VolunteerHub **My Hours** / **View Hours**, Better Impact **HOURS** (and they may only view or delete their own hours), and Volunteers for Salesforce **Report Hours**. CiviVolunteer disagrees for the current product: **Log Hours** is staff, and self-service hours are listed under future plans. SignUpGenius’s cited help does not describe hours.

4. **Check-in or attendance confirmation, where the product has it** — Golden automatic check-in/out and volunteer self-confirmation of attendance; VolunteerHub **Check In** / **Check Out** on **My Schedule** when the code feature is turned on; Better Impact **Confirm** on **Schedule** (an acknowledgement, not a kiosk) plus a separate **Timeclock**. CiviVolunteer, Volunteers for Salesforce personal-site pages, and the SignUpGenius articles consulted do not document volunteer check-in. These are not one shared status enum.

5. **A profile next to the schedule** — Golden **Profile** / app **Account**, Better Impact **MY PROFILE**, Volunteers for Salesforce **View your information** (contact plus shifts and history). VolunteerHub hangs **My Hours** on the volunteer’s profile. SignUpGenius’s cited dashboard is the sign-up list, not a contact profile. CiviVolunteer collects profile fields on the sign-up form and does not document a post-assignment profile page.

**Where “only my work” fails:** SignUpGenius’s sign-up page shows every participant’s name and public comment unless the creator hides them. Better Impact **OPPORTUNITIES** and the HOURS activity list can show activities that are merely visible, not only assigned. CiviVolunteer’s sign-up form and roster show opportunities or everyone assigned. The personal schedule pages in Golden, VolunteerHub’s **My Schedule** wording, Better Impact’s **Schedule** / calendar feed, and the Salesforce personal site are the places written as that volunteer’s own assignments.
