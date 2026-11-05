# Altivance — Session Handoff

**Last updated:** 5 November 2026
**Point a new Claude session at this file to continue.**

> No passwords, keys or connection strings are in this document. Real values
> live in `.env.local` (git-ignored) and in the Vercel project settings.

---

## 1. Where things stand right now

The site is **live, public and working**.

| | |
|---|---|
| Live URL | https://apex-roan-eight.vercel.app |
| Second alias | https://apex-omg-tech-hub.vercel.app (same site) |
| Hosting | Vercel, project `omg-tech-hub/apex`, Hobby plan |
| Database | Neon Postgres (already provisioned, 16 tables) |
| Repo | https://github.com/omgtechhub/Apex-Consult, branch `main` |
| Admin login | /admin/login — account `davidomigie25@gmail.com` exists and works |
| Payments | Paystack **LIVE** keys are active |
| Scholarships | Showing 6 built-in fallbacks, NOT live pipeline data |

Deploying is `git push` to `main`. Verified working.

---

## 2. TO DO — David's actions

### 2a. Point altivance.com at the site  *(in progress)*

The domain is already attached to the Vercel project. Only DNS is left.

**First: find the IONOS account.**
- Search email inboxes for "IONOS" or "1&1" — annual billing receipts reveal
  which address owns the account. Try `davidomigie25@gmail.com` and
  `omigiegraphics@gmail.com`.
- The mail servers are `mx00.ionos.fr` / `mx01.ionos.fr` — the **.fr** suggests
  the account is on **IONOS France**, so try logging in at **ionos.fr**, not
  ionos.com.
- Failing that, use "Forgot password" at ionos.fr with each address.

**Then: change exactly two DNS records.**

1. Log in to IONOS
2. Domains & SSL -> altivance.com -> DNS
3. Find the row `Type = A`, `Name = @` (may show blank or `altivance.com`).
   Change its value from `217.160.0.233` to:

       64.29.17.1

4. Find or create the row `Type = CNAME`, `Name = www`, value:

       cname.vercel-dns.com

5. Save. Stop.

**DO NOT:**
- Do NOT change the nameservers. IONOS will offer to. Refuse. Changing them
  breaks `info@altivance.com` email.
- Do NOT touch any `MX` row. Those are the email records.

SSL issues automatically 10-60 minutes after DNS propagates.

### 2b. After the domain is live

- Update the Paystack webhook URL to
  `https://altivance.com/api/payments/webhook`
  (Paystack dashboard -> Settings -> API Keys & Webhooks)
- Ask Claude to verify the domain, SSL, and that canonical/OG/sitemap URLs
  flipped to altivance.com. They should flip with **no code change** — see §4.

### 2c. Test a real payment  *(not yet done)*

The site takes **live** payments and nobody has completed a checkout on it.
Buy a service for a small amount with a real card, confirm a row appears in
the `payments` table with `status = 'success'`, then refund it in Paystack.

---

## 3. OPEN DECISION — hosting plan

Vercel's **Hobby plan forbids commercial use**; all commercial usage requires
Pro ($20/month). A consultancy site taking live payments is commercial. The
risk is the project being paused, not a surprise bill.

Options discussed:

| Option | Cost | Work | Notes |
|---|---|---|---|
| **Netlify free** | $0 | ~1 hour | Free tier permits commercial use, runs Next.js SSR. Best fit. Verify Netlify's own ToS first. |
| Cloudflare free | $0 | ~half day | Commercial OK, needs `@opennextjs/cloudflare` adapter |
| IONOS VPS | ~EUR 5/mo | 1 day + admin | Full Node. The "VPS" originally planned. |
| Vercel Pro | $20/mo | none | Zero work, best experience |
| IONOS Deploy Now / shared hosting | — | weeks | **Will not work.** No Node runtime; static export or PHP rewrite only |

**Nothing is broken.** This is planning, not an emergency.

If migrating to Netlify: the DNS A record simply changes to Netlify's. Doing
the IONOS DNS change now does not lock anything in.

---

## 4. Key technical facts (so they are not rediscovered)

- **`src/lib/seo.ts`** resolves the site URL: `NEXT_PUBLIC_SITE_URL` ->
  `VERCEL_PROJECT_PRODUCTION_URL` -> `VERCEL_URL` -> localhost. This is why
  attaching altivance.com needs **no code change** — canonicals, OG tags,
  sitemap and robots.txt all follow the production domain automatically.
  `NEXT_PUBLIC_SITE_URL` is deliberately left unset.
- **`src/lib/site-url.ts`** is a different job: per-request origin from
  `x-forwarded-host`, used for Paystack callback URLs. Leave it alone.
- **`DATABASE_URL` on Vercel must be the Neon POOLED endpoint**
  (`...-pooler...`), not the direct one in `.env.local`.
- **`SCHOLARSHIP_API_URL` must be the Render URL** in production. Local
  `.env.local` says `localhost:3001`; a wrong value silently serves
  `FALLBACK_SCHOLARSHIPS` instead of real data.
- **Deployment protection** (`ssoProtection`) was ON by default and 302'd every
  public URL to a Vercel login. Disabled 5 Nov 2026. A new Vercel project will
  have it on again.
- **After a CLI `--prod` deploy, aliases are NOT promoted automatically.** Run
  `vercel promote <deployment-url> --scope omg-tech-hub`, then curl the alias
  (not the deployment URL) to confirm. Git-push deploys do alias correctly.
- **`npm run dev` is started by David**, not by Claude. To test a build without
  disturbing it: `NEXT_DIST_DIR=.next-preview npx next build` then
  `npx next start -p 3100`.

---

## 5. Scholarship pipeline — known broken

Separate repo: `C:\xampp\htdocs\apex-scholarship-pipeline` (Next.js + Prisma +
BullMQ, ~10,500 lines).

- The API at `apex-scholarship-api.onrender.com` is **up but publishes zero
  scholarships**. Cold start takes ~60s on Render free tier.
- The site therefore shows 6 curated fallbacks. This is by design and looks
  fine to visitors, but no real data has ever reached production.
- The **30-minute crawler is correctly configured** (`schedule: "*/30 * * * *"`
  in `render.yaml`) but the worker and cron are both `plan: starter` — two
  **paid** Render services, roughly $14/month total.
- **Article generation fails ~47% of the time** (local DB: 33 PUBLISHED vs
  29 FAILED). The public API only exposes scholarships that have a published
  article, so every failure silently removes a scholarship from the site.
- 4 crawler jobs have been stuck in `RUNNING` since 15 August 2026.

**Recommendation: fix the article failures before paying for the workers**,
otherwise the money buys a crawler that discards half its output.

---

## 6. Recently fixed (do not re-investigate)

- OG image was broken two ways: pointed at a domain that 404'd, and showed the
  old brand "APEX ACADEMIC CONSULTANCY". Now generated at build time from
  `src/app/opengraph-image.tsx`.
- No `robots.txt` or `sitemap.xml` existed. Both added, plus `llms.txt` and
  FAQPage JSON-LD for AI assistants.
- Service pages had no payment link at all — `/pay` was reachable only from one
  footer link. "Pay for This Service" CTA added.
- Booking form step 2 was clipped off-screen on mobile (grid column resolved to
  778px inside a 487px viewport). Fixed with `grid-cols-1`.
- 17 pages had doubled titles.
- `scripts/create-staff.mjs` did not load `.env.local` and hung without a TTY.
