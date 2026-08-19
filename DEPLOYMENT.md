# Deployment

## Frontend: Netlify

The root `netlify.toml` configures the Vite build and React Router fallback.

Set this Netlify environment variable:

```text
VITE_API_URL=https://<backend-host>/api
```

## Backend: Render

The root `render.yaml` configures the Node service. Create a PostgreSQL database with a provider such as Neon, Supabase, Render, or Railway, then enter these Render environment variables:

```text
DATABASE_URL=<pooled-postgresql-connection-string>
DIRECT_URL=<direct-postgresql-connection-string>
CORS_ORIGIN=https://<your-site>.netlify.app
JWT_SECRET=<long-random-secret>
```

`DIRECT_URL` must be a direct PostgreSQL connection string for Prisma migrations. `DATABASE_URL` may be the provider's pooled connection string. Both must point to the same database.

After deployment, verify:

```text
https://<backend-host>/api/health
```

It should return a JSON response with `status: "ok"`. Then set `VITE_API_URL` in Netlify to that backend URL followed by `/api`, trigger a new deploy, and test login.
