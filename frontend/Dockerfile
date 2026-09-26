# Built from the repo root: the typed API client imports AppType from backend/src.
FROM node:22-alpine AS build
WORKDIR /app

COPY backend/package.json backend/package-lock.json backend/
RUN npm ci --prefix backend --ignore-scripts
COPY frontend/package.json frontend/package-lock.json frontend/
RUN npm ci --prefix frontend

COPY backend/src backend/src
COPY backend/tsconfig.json backend/
COPY frontend frontend

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build --prefix frontend

FROM caddy:2-alpine
COPY frontend/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/frontend/dist /srv
