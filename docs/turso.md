# Turso Cloud setup

The app already uses `@libsql/client` and reads the database connection from `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. The timetable/auth/database helpers fall back to local SQLite only when Turso variables are absent.

## 1. Create the Turso database

Install/login to the Turso CLI, then create a database:

```bash
turso auth login
turso db create jee-prep
```

Get the connection URL and a database token:

```bash
turso db show jee-prep --url
turso db tokens create jee-prep
```

Turso documents database creation and database-scoped tokens in the CLI reference.

## 2. Configure Vercel

Add these server-only environment variables to the Vercel project:

```text
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

Apply them to Production, Preview, and Development as needed. Do not use `NEXT_PUBLIC_` for either value.

## 3. Local development

Put the same values in `.env.local`, or run:

```bash
vercel env pull .env.development.local
```

The application already has `@libsql/client` installed and connects with the standard Turso URL/token pair.

## 4. Schema

The current project uses `src/lib/database.ts` to bootstrap the application schema with idempotent `CREATE TABLE IF NOT EXISTS` statements. The personal timetable route also ensures its own table and performs additive column upgrades for visibility fields.

That means a newly provisioned Turso database can be initialized by the application without a manual migration command. For larger future schema changes, move this bootstrap logic to explicit migrations before production scale-up.

## 5. Visibility model

`PersonalTimetable.visibility` supports:

- `private` — share links are rejected and the previous link is revoked.
- `parent_teacher` — read-only bearer link intended for parents/teachers.
- `anyone_with_link` — read-only bearer link for anyone who possesses it.

The table also stores optional expiry and revocation timestamps. Rotating a link invalidates the previous token.
