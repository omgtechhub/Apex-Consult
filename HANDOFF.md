# Altivance — Session Handoff

**Last updated:** 14 November 2026
**Point a new Claude session at this file to continue.**

> No passwords, keys or connection strings are in this document. Real values
> live in `.env.local` (git-ignored) and in the Vercel project settings.

---

## 1. Where things stand right now

The site is **live, public and working**.

| | |
|---|---|
| **Primary URL (new)** | **https://altivance-ng.netlify.app** — Netlify, live and verified 14 Nov 2026 |
| Hosting | **Netlify free**, team `omg-tech-hub`, project `altivance-ng`. See §3 |
| Old URL (still up) | https://apex-roan-eight.vercel.app — Vercel, kept ~1 week as rollback |
| Database | Neon Postgres (16 tables), **pooled** endpoint on Netlify |
| Repo | https://github.com/omgtechhub/Apex-Consult, branch `main` |
| Admin login | /admin/login — account `davidomigie25@gmail.com` exists and works |
| Payments | Paystack **LIVE** keys active on both hosts. **No real checkout has ever been completed** (§2d) |
| Scholarships | Showing 6 built-in fallbacks, NOT live pipeline data |
| Domain | Buying **altivance.com.ng** — see §2a and §7. `altivance.com` is NOT ours |

**Deploying is `git push` to `main` — this now deploys to BOTH hosts.** Netlify
builds via the deploy-key + webhook setup in §3. Vercel's GitHub integration is
also live: the pushes on 14 Nov 2026 each produced a Vercel production
deployment. An earlier note in this file claimed git push did not deploy to
Vercel; that was wrong, inferred from a stale deployment list.

Do **not** run `netlify deploy --build` on this machine — it fails at the blob
upload step on Node 26. See §3.

---

## 2. TO DO — David's actions

### 2a. Buy the .ng domain and point it at the site  *(in progress)*

Budget is now available for this. Two decisions are coupled and should be made
together, in this order:

1. **Pick the host** — see §3. Decided: **Netlify free**.
2. **Buy the domain** — see §2b.
3. **Point the domain at the host** — DNS, below.

Do not buy hosting from the domain registrar. Nigerian registrars bundle
cPanel/shared hosting, which **cannot run this app** — Next.js needs a Node
runtime. Buy the domain only; the app stays on Netlify/Vercel.

**DNS records to create at the registrar** (values depend on the chosen host —
read them off the host's dashboard, do not copy them from here):

| Host | `A` record for `@` | `CNAME` for `www` |
|---|---|---|
| Netlify | the IP Netlify shows for the site | `<site-name>.netlify.app` |
| Vercel | the IP Vercel shows for the domain | `cname.vercel-dns.com` |

Netlify's preferred setup is to delegate the whole zone to Netlify DNS instead
of setting an A record. That is fine here — nothing else uses this zone, since
the new domain starts with no email on it. Decide this when the domain exists.

SSL issues automatically within 10-60 minutes of DNS propagating. Do not buy an
SSL certificate from the registrar; both hosts issue Let's Encrypt free.

### 2b. Choosing the registrar

See the recommendation in §7. Rules that matter regardless of which is picked:

- Compare the **renewal** price, not the first-year promo. Direct `.ng` renewals
  cluster around NGN 15,000-18,000/yr.
- Require full DNS record control (custom `A`, `CNAME`, `TXT`) with no hosting
  package attached, and the ability to set custom nameservers.
- `.com.ng` costs roughly a third of a direct `.ng` and is the conventional
  Nigerian business domain. A direct `.ng` is shorter and reads as more premium.

### 2c. Decommission the old altivance.com references  *(code done 14 Nov 2026)*

**`altivance.com` was never David's domain.** It resolves to `217.160.0.233`
behind a third party's mail host — somebody else's infrastructure entirely. The
site had been printing `info@altivance.com` as its public contact address, so
customer email was being sent to a stranger.

**Done in code** — swept to `info@altivance.com.ng` across 7 files
(`contact`, `privacy`, `refund`, `terms` pages, `Footer.tsx`, the
`LoginForm.tsx` placeholder, and `.env.example`). Verified present in 108 pages
of build output. The brand name "Altivance" in page copy is correct and stays;
this was only ever about the domain and the email address.

**Still outstanding — David's actions:**

1. **Buy `altivance.com.ng`.** As of 14 Nov 2026 it has no NS or SOA record,
   which strongly suggests it is unregistered — but DNS is not a registration
   check. Confirm at the registrar's search before counting on the name.
2. **Set up email on it.** `info@altivance.com.ng` is now advertised site-wide
   and will bounce until a mailbox exists. Free options: **Cloudflare Email
   Routing** (forwards `info@` to Gmail, free, needs the domain's nameservers on
   Cloudflare) or **Zoho Mail** free tier (a real mailbox, keeps DNS where it
   is). This is the one item that is user-visible and currently broken.
3. **URGENT — remove `altivance.com` from the Vercel project.** It is not merely
   attached and unverifiable; it is set as that project's **production domain**,
   so `VERCEL_PROJECT_PRODUCTION_URL` resolves to it and the live Vercel site
   emits, on every page:

       <link rel="canonical" href="https://altivance.com">

   Confirmed live on 14 Nov 2026. The site is telling Google that the canonical
   address of all its content is a **third party's domain**. That hands search
   equity to a stranger and can get the real pages dropped as duplicates.
   Vercel dashboard -> project -> Settings -> Domains -> remove `altivance.com`.
   The Netlify site is unaffected — its canonicals are correct.

Two historical references to `altivance.com` remain **on purpose**, in the
explanatory comments at the top of `src/lib/seo.ts`. They document the bug that
file exists to prevent. Do not "clean" them up.

### 2d. Test a real payment  *(not yet done)*

The site takes **live** payments and nobody has completed a checkout on it.
Buy a service for a small amount with a real card, confirm a row appears in
the `payments` table with `status = 'success'`, then refund it in Paystack.

### 2e. After the domain is live

- Update the Paystack webhook URL to `https://<new-domain>/api/payments/webhook`
  (Paystack dashboard -> Settings -> API Keys & Webhooks)
- Ask Claude to verify the domain, SSL, and that canonical/OG/sitemap URLs
  flipped to the new domain. They flip with **no code change** — see §4.

---

## 3. DECIDED — move hosting to Netlify free

**Verified against the primary sources on 14 Nov 2026**, not blog summaries.

**The problem with staying on Vercel:** the Hobby plan forbids commercial use.
A consultancy site taking live Paystack payments is commercial. The exposure is
the project being paused, not a surprise bill.

**Why Netlify free is the fix.** Netlify's Self-Serve Subscription Agreement
(dated Nov 2026) contains **no commercial-use restriction at any plan tier** —
the word "commercial" appears in it only as "commercially reasonable". The one
relevant restriction, §2.5(a), is about reselling:

> Customer will not: (a) resell, sublicense, or otherwise make the Services
> available to third parties as a standalone service, **except that Customer may
> use the Services to build, deploy, and host sites and applications for third
> parties**

Running a business on it is exactly what that permits. And §4.1 rules out a
surprise invoice:

> Customer will not be charged for use on the Free Usage Tier, and Netlify may
> **pause** the affected Services if that use exceeds the capacity included in
> the Free Usage Tier.

So the failure mode is a paused site, never a bill.

**The honest caveat — no free tier is contractually permanent.** Netlify §5.1:

> Netlify offers the Free Usage Tier at its sole discretion and may change its
> features, limits, or availability, or **discontinue it, at any time**. Netlify
> may suspend, disable, or remove any site or application on the Free Usage Tier
> at any time, with or without notice, for any reason or no reason.

Every provider reserves this, Cloudflare included (its §2.6 is near-identical).
No host will promise never to ask for money later. The real distinction is:
**on Vercel Hobby the terms are breached today; on Netlify free they are not.**

**Free plan capacity:** 300 credits/month, resetting monthly. Production deploys
cost 15 credits each, bandwidth 20 credits/GB, web requests 2 credits/10k. That
works out to roughly 20 production deploys **or** ~15 GB of bandwidth a month —
deploy count is the binding constraint during active development, not traffic.
Netlify confirms **full support** for App Router, SSR, React Server Components,
Route Handlers, Middleware and ISR via its OpenNext adapter, with no plan gate,
for every Next.js version from 13.5 up.

| Option | Cost | Work | Notes |
|---|---|---|---|
| **Netlify free** | $0 | ~1 hour | **Chosen.** Commercial use permitted in writing; hard pause, never billed; full Next.js SSR |
| Cloudflare free | $0 | ~half day | Commercial OK, but **two blockers**: free Workers cap CPU at **10 ms/request** (tight for SSR), and terms §2.2.1(h) forbids handling card data on a free-plan property. Needs `@opennextjs/cloudflare` |
| Vercel Pro | $20/mo | none | Zero work, best experience. The fallback once revenue covers it |
| Render / Railway | ~$7/mo | ~2 hours | Full Node, no tier games. Already using Render for the scholarship API |
| Registrar shared hosting | — | n/a | **Will not work.** No Node runtime |

**Nothing is broken.** Migrating is planning, not an emergency. The DNS A record
simply points at Netlify instead. Buying the domain now locks nothing in.

### MIGRATION DONE — 14 Nov 2026. Netlify is live and verified.

**The Netlify site is up, built from `main`, and fully working.**

| | |
|---|---|
| URL | https://altivance-ng.netlify.app |
| Admin | https://app.netlify.com/projects/altivance-ng |
| Site ID | `b47e755c-347e-48cb-baa5-869eb5267cb4` |
| Team | `omg-tech-hub` (Free) |
| Account | omgtechhub@gmail.com |

**Continuous deployment is wired and proven.** A push to `main` triggers a
Netlify build automatically. This was set up without the Netlify GitHub App:

- Netlify **deploy key** `6af82483a193d182a4d6ad37`, added to the GitHub repo as
  a read-only deploy key (GitHub key id `169858381`). This is what lets Netlify
  clone the repo.
- Netlify **build hook** `6af824cac588bc470b26eb8d` (branch `main`).
- **GitHub webhook** id `711694983`, `push` events, pointing at that build hook.

Verified by pushing `ae70b09` and watching the build fire and go green.

**Verified working on the deployed site** (every route 200):
`/`, `/services`, `/services/[slug]`, `/pricing`, `/contact`, `/blog`,
`/scholarships`, `/book`, `/pay`, `/faq`, `/testimonials`, `/admin/login`,
`/api/health`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/opengraph-image`.

- **Database:** `/api/health` runs `select 1` through Drizzle and returns
  `{"ok":true}` — the **pooled** Neon endpoint works from Netlify's function.
- **SSR:** blog renders real posts from Postgres; `Cache-Status: "Netlify
  Durable"` headers confirm the SSR function is serving.
- **Server Actions:** the admin login form renders.
- **Paystack:** `/pay` renders the payment form with no test-mode banner, so
  `isLiveMode()` is true — the **live** secret key is readable by the function.
- **SEO:** canonical, `og:url`, `og:image` and every `sitemap.xml` entry resolve
  to `https://altivance-ng.netlify.app`. This is the `seo.ts` fix working in
  production; without it they would all have said `http://localhost:3000`.
- **Scholarships:** still the 6 built-in fallbacks, same as Vercel. No regression.

### Three traps hit during the migration — do not rediscover these

1. **New Netlify sites are PRIVATE by default.** `sso_login` was `true`, and
   every URL returned **401** with a redirect to `app.netlify.com/edge-access`.
   This is the exact analogue of Vercel's `ssoProtection` (see §4). Fixed with:

       netlify api updateSite --data '{"site_id":"<id>","body":{"sso_login":false}}'

   **Any new Netlify project will have this on again.**

2. **The Next.js runtime plugin did NOT auto-attach**, because the site was
   created via the API rather than Netlify's "import from Git" UI. The first
   cloud build published the raw `.next` directory as static output —
   `/build-manifest.json`, `/build/chunks/*`, `/cache/*`, no HTML, no SSR
   function — and every route 404'd while the deploy reported "ready".
   Fixed by declaring it in `netlify.toml`:

       [[plugins]]
         package = "@netlify/plugin-nextjs"

   No version, so Netlify still resolves the latest at build time. Do not add
   it to `package.json`.

3. **`netlify deploy --build` fails locally on this machine.** `next build` and
   function bundling both succeed, then the "Uploading blobs to deploy store"
   step dies with `fetch failed`, reproducibly. Plain HTTPS to
   `api.netlify.com` works from both curl and node, so it is not the network —
   almost certainly **Node v26.13.0**, which is newer than netlify-cli 27.19.0
   supports. **Deploy by pushing to `main`, or with
   `netlify api createSiteBuild`, and let Netlify build in the cloud.** That is
   the recommended model anyway.

### Still to do on the Netlify side

1. **Buy `altivance.com.ng`** (§2a, §7), then add it in Netlify:
   Project -> Domain management -> Add a domain.
2. **Set `NEXT_PUBLIC_SITE_URL=https://altivance.com.ng`** once DNS resolves,
   then redeploy. Until then the `URL` fallback correctly serves
   `altivance-ng.netlify.app`.
3. **Update the Paystack webhook** to
   `https://altivance.com.ng/api/payments/webhook`.
4. **Test a real payment on Netlify** (§2d) — still nobody has completed a
   checkout anywhere.
5. **Keep Vercel for about a week as rollback**, then delete the project. See
   the warning in §2c about `altivance.com` still being attached to it.

Environment variables set on Netlify (4 — all verified in use):
`DATABASE_URL` (pooled), `PAYSTACK_SECRET_KEY` (live),
`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` (live), `SCHOLARSHIP_API_URL` (Render).

`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is in fact **never read by the code** — it
appears only in a doc comment in `src/lib/payments/paystack.ts`. Payment is
entirely server-side: the secret key calls Paystack's API and the customer is
redirected to Paystack's hosted checkout, so card details never touch this
domain. Harmless to leave set.

**Watch the deploy budget.** 300 credits/month, 15 credits per production
deploy, so roughly 20 production deploys a month. Work on a branch and merge
when ready rather than pushing straight to `main` repeatedly.

---

## 4. Key technical facts (so they are not rediscovered)

- **`src/lib/seo.ts`** resolves the site URL: `NEXT_PUBLIC_SITE_URL` ->
  `VERCEL_PROJECT_PRODUCTION_URL` -> `URL` (Netlify) -> `VERCEL_URL` ->
  `DEPLOY_PRIME_URL` (Netlify) -> localhost. This is why attaching the new
  domain needs **no code change** — canonicals, OG tags, sitemap and robots.txt
  all follow the production domain automatically, on either host.
  `NEXT_PUBLIC_SITE_URL` is deliberately left unset in development.
  The Netlify entries were added 14 Nov 2026; without them the site would have
  emitted localhost canonicals on Netlify. See §3.
- **`src/lib/site-url.ts`** is a different job: per-request origin from
  `x-forwarded-host`, used for Paystack callback URLs. Leave it alone.
- **`DATABASE_URL` must be the Neon POOLED endpoint on BOTH hosts**
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

---

## 7. Buying the .ng domain — registrar comparison

Checked 14 Nov 2026. **NiRA is the `.ng` registry and does not sell to the
public** — "It does not register domains directly for Registrants (end users)."
Every `.ng` must be bought through an accredited registrar, so prices are set by
the registrar, not the registry. NiRA publishes no public price list.

### Prices read live off the registrars' own pages

| Registrar | `.ng` yr 1 | `.ng` renewal | `.com.ng` yr 1 | `.com.ng` renewal |
|---|---|---|---|---|
| **Truehost** (truehost.com.ng) | NGN 9,000 *(offer)* | **NGN 15,000** | NGN 6,500 | NGN 7,000 |
| **DomainKing** (domainking.ng) | NGN 17,500 | **NGN 18,000** | NGN 6,449 | NGN 8,000 |

Truehost's own page contradicts itself on `.ng` year one — the table says
NGN 9,000 "(offer)" while the hero says "From 14000.00 NGN". Treat 9,000 as a
promo that may not appear at checkout.

**Not verifiable:** WhoGoHost, Qservers and GO54 all render prices inside a
logged-in client area (WhoGoHost 302s to a login; Qservers returns HTTP 406 to
automated requests), so their numbers could not be confirmed. Blog comparisons
quoting them disagree with each other and are not trustworthy. Market-wide,
direct `.ng` renewals cluster at **NGN 13,000-18,000/yr** and `.com.ng` at
**NGN 5,500-9,000/yr**.

### Recommendation

**Truehost for price, DomainKing for confidence.**

- **Cheapest credible:** Truehost. NGN 15,000 renewal on a direct `.ng` is the
  lowest *published renewal* found. Offers DNS management without a hosting
  package. 30-day grace, 75-day redemption on expiry.
- **Best quality:** DomainKing. Costs ~NGN 3,000/yr more but publishes the
  clearest terms, free transfers, and explicitly states what this project needs:
  "DNS Hosting: ... managing your DNS from the client area without needing a web
  hosting package attached to it" and "Nameserver Management: Point your domain
  name to any host or use custom nameservers."

On a ~NGN 3,000/yr difference, buy on reliability, not price — a registrar
losing the domain or mishandling DNS costs far more than NGN 3,000.

**Consider `.com.ng` instead.** At ~NGN 6,500 registration and NGN 7,000-8,000
renewal it is less than half a direct `.ng`, and in Nigeria `.com.ng` reads as a
normal established business domain rather than a compromise.

### Checklist when buying

1. Verify the registrar on NiRA's accredited list first (nira.org.ng) — neither
   registrar above has been cross-checked against it; both only claim it.
2. Check the **renewal** price on the checkout page, not the advertised year one.
3. Decline every upsell: hosting, email hosting, SSL, website builder. None are
   needed — the app is on Netlify and SSL is free and automatic.
4. Confirm you get DNS record control (`A`, `CNAME`, `TXT`) before paying.
5. Confirm the price shown includes VAT. Neither registrar states its VAT
   treatment.
6. Enable auto-renew, or diary the renewal date. A lapsed domain takes the live
   site down.

---

## 8. Also fixed 14 Nov 2026 (do not re-investigate)

- **All references to the old European registrar/host were removed** at David's
  request — it is not his provider and never hosted anything in this project.
  They existed only in this file (11 mentions: account-recovery steps, DNS
  record instructions, and two rows in the hosting-options table). The old
  `altivance.com` sits on that provider because it belongs to a third party.
  Verified: zero matches remain anywhere in the repo.
- **Public contact address corrected** from `info@altivance.com` (a stranger's
  domain) to `info@altivance.com.ng`. See §2c — the mailbox still needs creating.
- **`src/lib/seo.ts` made host-agnostic** so canonicals/OG/sitemap survive the
  move to Netlify. See §3.

---

## 9. Credential hygiene — action recommended

During the Netlify migration on 14 Nov 2026, `netlify env:import` **echoed the
imported values to the terminal in plaintext**. The live Paystack secret key and
the Neon database password therefore appear in that session's scrollback and in
any saved transcript of it.

Nothing was sent anywhere it should not have been — the values went only to
Netlify, and they already existed in `.env.local` and in the
`Project-Local-Secrets` backup. But a **live** payment key in a log is worth
closing off:

1. **Rotate the Paystack secret key.** Paystack dashboard -> Settings ->
   API Keys & Webhooks -> roll the secret key. Then update it in
   Netlify (Project -> Environment variables), in Vercel while that project
   still exists, and in `.env.local`.
2. **Rotate the Neon password** if the transcript was shared. Neon console ->
   Roles -> reset password for `neondb_owner`, then update `DATABASE_URL` in
   both hosts and `.env.local` — remembering the **pooled** host for the hosts
   and the direct host locally.
3. If the transcript was never shared or stored outside this machine, the
   practical risk is low and this can wait. Do not skip it indefinitely while
   live keys are in play.

Also note `vercel env pull` **cannot** retrieve Vercel "Secret"-type values —
it writes `[SENSITIVE]` placeholders. The four Netlify values were rebuilt from
`.env.local`, the `Project-Local-Secrets` backup, and by deriving the pooled
Neon host from the direct one. Expect to do the same on any future host move.
