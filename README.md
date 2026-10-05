# Volunteer Platform

This repository contains a full-stack volunteer management and public engagement platform for a community organisation. The application combines a public-facing website with protected admin and volunteer dashboards for managing content, opportunities, applications, assignments, and event logistics.

## Overview

The system is split into two main services:

- Backend: Hono + TypeScript API with MongoDB persistence, Better Auth for authentication, and S3-compatible storage for uploaded assets.
- Frontend: React + Vite + TypeScript client for the public site, admin desk, and volunteer workflow.

For the full API route reference, auth model, and endpoint summary, see [backend/README.md](backend/README.md).

## Features

- Public website pages for programmes, volunteering, contact, media, and donation information
- Volunteer desk for schedules, spaces, and work allocation
- Admin desk for managing opportunities, applications, assignments, content, and messages
- Role-based access using admin and volunteer user roles
- Content and opportunity CRUD routes served by the backend API
- S3-backed media storage and MongoDB data persistence
- Health checks for database and bucket connectivity

## Repository structure

- `backend/` — API server, auth, DB access, storage, and route definitions
- `frontend/` — React app for the public and staff interfaces
- `docs/` — research notes and work logs for the project

## Tech stack

- Frontend: React 19, Vite, React Router, TanStack Query, TypeScript
- Backend: Hono, TypeScript, MongoDB, Better Auth, Zod
- Storage: AWS S3-compatible bucket
- Deployment notes: Railway and Docker are configured for backend/frontend hosting

## Local development

### 1. Configure the backend environment

Create a `.env` file inside the `backend/` directory with the required variables:

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

> The app expects MongoDB and an S3-compatible object store to be available during local development.

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Start the backend

```bash
cd backend
npm run dev
```

The backend listens on `http://localhost:3000` by default.

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

The frontend runs at `http://localhost:5173` by default.

## Available scripts

### Backend

```bash
npm run dev
npm run db:setup
npm run build
npm run start
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

## Notes

- The frontend client is typed from the backend route tree (`AppType` in `backend/src/index.ts`).
- `frontend` builds with TypeScript checks and the project expects backend dependencies to be installed before production builds are run in the frontend.
- The backend exposes a `/health` route that reports database and bucket connectivity.
- Admin and volunteer default users are created automatically when their corresponding environment values are present.

## Project status

This codebase is a work-in-progress volunteer platform with a public site, protected staff areas, and a backend API suitable for integration with MongoDB and storage-backed media workflows.

## Legacy Static Website

The original static HTML version of the BOAC site is kept in [legacy-static-site/](legacy-static-site/) for reference. It is not part of the build; the live public site is the React app in `frontend/src/public/`.
