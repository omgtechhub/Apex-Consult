# Admin area — setup

## 1. Get a Postgres database (~3 minutes, free)

The app targets Postgres. `DATABASE_URL` is currently set to a SQLite path
(`file:./dev.db`), which the Postgres driver cannot open — this is why
`/api/health` returns `{"ok":false}` and why contact forms, bookings and
newsletter signups have not been saving.

**Neon** is the simplest option and the free tier is enough:

1. Go to <https://neon.com> and sign up (GitHub or Google login works).
2. Click **Create project**. Any name; pick the region closest to Nigeria
   (usually `AWS eu-central-1`).
3. On the project page, copy the **Connection string**. It looks like:
   `postgresql://user:PASSWORD@ep-something.eu-central-1.aws.neon.tech/neondb?sslmode=require`
4. Create a file called `.env.local` in the project root:

   ```
   DATABASE_URL=postgresql://…paste the whole string here…
   ```

`.env.local` is git-ignored, so the credential stays off GitHub. The same URL
works in production — set it as an environment variable on your host.

Supabase and Railway both work identically; only the dashboard differs.

## 2. Create the tables

```
npx drizzle-kit push
```

Reads `src/db/schema.ts` and creates every table. Safe to re-run.

## 3. Create the first admin

```
node scripts/create-staff.mjs "Your Name" you@apexacademic.com admin
```

It prompts for a password (minimum 10 characters) rather than taking it as an
argument, so it never lands in shell history. Re-running for the same email
resets that account's password.

Add consultants the same way with `consultant` as the last argument.

## 4. Sign in

Restart the dev server so it picks up `.env.local`, then go to `/admin/login`.

---

## Roles

| Capability            | Admin | Consultant |
|-----------------------|:-----:|:----------:|
| Write / edit posts    |   ✓   |     ✓      |
| Publish posts         |   ✓   |     ✓      |
| Handle client threads |   ✓   |     ✓      |
| Moderate comments     |   ✓   |     —      |
| Approve testimonials  |   ✓   |     —      |
| Manage staff accounts |   ✓   |     —      |
| View activity log     |   ✓   |     —      |

Consultants never receive the admin-only navigation, and every one of those
routes re-checks the role server-side — a hidden link is not a permission.

## Security notes

- Passwords are scrypt hashes with a per-password salt. The database never
  stores anything replayable.
- Session tokens are random and stored as SHA-256 digests, so a database dump
  yields no usable cookies.
- Sessions are server-side, not JWTs, so suspending an account takes effect on
  that account's very next request.
- The auth check runs in a server layout, not `middleware.ts`. Next middleware
  runs on the Edge runtime where `pg` and `node:crypto` are unavailable, so it
  could only check that *some* cookie exists — which is not authentication.
