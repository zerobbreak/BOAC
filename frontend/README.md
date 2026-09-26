```
npm install --prefix ../backend
npm install
npm run dev
```

The API client in `src/lib/api-client.ts` takes its types from the backend's routes (`AppType` in
`backend/src/index.ts`), so `npm run build` also type-checks the backend code. Install the backend's packages
first, including on any host that builds the frontend.

## Layout

```
src/
  main.tsx          entry point
  app/              route table, signed-in shell, public layout, styles
  lib/              API client, query client, auth client and roles
  admin/            admin desk pages, admin-routes.tsx, queries.ts
  volunteer/        volunteer desk pages, volunteer-routes.tsx, queries.ts, format.ts
  public/           pages anyone can open without signing in, queries.ts
  auth/             sign-in page
```

- File names are kebab-case (`contact-page.tsx`); components inside stay PascalCase (`ContactPage`).
- A page lives in the folder of the area it belongs to, with that area's queries beside it.
- Data is fetched with TanStack Query. After a change, invalidate the queries the change affects, using the
  exported query's `queryKey` rather than retyping the key.
