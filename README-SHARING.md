# Testing the site on someone else's device

**One command, in `C:\xampp\htdocs\apex`:**

```
npm run share
```

It builds the site, serves it on :3100, opens a Cloudflare tunnel, and prints a
link. Send the link. It opens straight to the site on any device — iPhone,
Android, any PC, anywhere — with no warning page, no sign-in and nothing for the
recipient to configure.

Ctrl-C stops the server and the tunnel together. The link is new every run.

```
npm run share                  # build, serve, tunnel
npm run share -- --skip-build  # reuse the last build (faster to start)
npm run share -- --dev         # tunnel `npm run dev` on :3000 instead
```

Use `--dev` only when you need hot reload while someone watches. It is roughly
**5x heavier for the visitor** and feels chronically sluggish on a phone — see
below.

Your own `npm run dev` on :3000 is untouched throughout; the build goes to a
separate directory and a separate port.

> **Do not use VS Code's Ports panel for this.** It works on desktop but loops
> forever on an iPhone, for a reason that has nothing to do with this app — see
> *iPhone / iPad* below.

## Why forwarding the dev server's port doesn't work

It is not a configuration mistake and it is not the firewall. Forwarding port
3000 *does* connect — the HTML arrives, the server responds 200 to everything.
It is just unusably slow on anyone else's device, in a way that reads as
"broken" rather than "slow". Three things compound, measured against this
project on a live Dev Tunnel:

**1. The tunnel forbids all caching.** The relay rewrites every response's
headers to `Cache-Control: no-cache,no-store`. It does this unconditionally —
a font that the server marked `public, max-age=31536000, immutable` comes out of
the tunnel uncacheable:

```
local : Cache-Control: public, max-age=31536000, immutable
tunnel: Cache-Control: no-cache,no-store
        Cache-Control: public, max-age=31536000, immutable
```

So the visiting browser is *forbidden* from caching anything and re-downloads
the whole site on every page view and every client-side navigation.

**2. Every request costs 1–4 seconds through the relay**, against 0.15s
locally. A first request to an uncompiled route took 6–14 seconds.

**3. `next dev` deliberately does not bundle.** Turbopack serves the app as many
small chunks so that rebuilds stay fast. The home page alone pulls **28**
separate JS/CSS files, and each new route is compiled on first request.

Multiply those: ~30 uncacheable requests at 1–4s each, repeated on every
navigation. A phone spends a minute or more on a page that never finishes. And
if any single chunk is dropped — one was, in testing — React never hydrates at
all, so the page sits there fully styled and completely dead: no menu opens, no
scroll animation fires, no button responds. That is the failure, and no config
change fixes it, because the cost is per-request and the *request count* is the
problem.

## Why a production build fixes it

A production build removes the cause instead of working around it. Measured on
this project, one home-page load:

|                  | requests | uncompressed |
|------------------|---------:|-------------:|
| `npm run dev`    |       29 |      5.81 MB |
| `npm run preview`|       18 |      1.22 MB |

That is **4.8× less data over 38% fewer requests**, and the HTML itself came
back in 0.04s against 0.59s. On top of that, every route is compiled up front,
so no request pays the 6–14s first-compile cost, and there is no HMR socket and
no dev overlay.

The tunnel still refuses to let anything cache, so this is not as fast as a real
deployment — but it is the difference between a page that loads and a page that
never finishes, and there is far less left to drop mid-hydration.

### It will not disturb your dev server

`npm run preview` builds into `.next-preview` and serves on port 3100. Building
into the live `.next` while `next dev` is running desynchronises the dev
server's chunk graph and breaks the page it is serving — hence the separate
directory, wired through `NEXT_DIST_DIR` in `next.config.ts`.

```
npm run preview                    # build, then serve on :3100
npm run preview -- --port 4000     # a different port
npm run preview -- --skip-build    # re-serve the last build, no rebuild
```

Re-run it after changing code — a production build is a snapshot, so there is no
hot reload. That is the trade: use `npm run dev` on :3000 for your own work, and
`npm run preview` when you want to hand the link to someone.

## iPhone / iPad: the Microsoft warning page loops

**Symptom:** on an iPhone the link does nothing useful — you get a Microsoft
page saying *"You are about to connect to a developer tunnel at …"*, you tap
**Continue**, and the same warning comes straight back. The page claims "This
warning will only be shown once per tunnel", which is why it reads as broken
rather than as a prompt.

**Cause.** Dev Tunnels puts an anti-phishing interstitial in front of every
public tunnel for browser navigations. Verified on this tunnel: a request
carrying a browser's `Sec-Fetch-Dest: document` and `Accept: text/html` gets the
10,835-byte warning page; the identical request carrying one cookie gets the
real 223,358-byte site with `X-Powered-By: Next.js`. The gate is that single
cookie:

```
tunnel_phishing_protection = <tunnel-name>.<region>
```

and the **Continue** button sets it from JavaScript:

```js
document.cookie = cname + "=" + cvalue + ";" + expires +
                  ";path=/;samesite=none;secure";
window.location.reload();
```

`SameSite=None`, `Partitioned`, set client-side. iOS Safari blocks and purges
exactly that shape of cookie under **Prevent Cross-Site Tracking**, which is on
by default. So the cookie never sticks, the reload hits the gate again, and you
loop forever. Nothing about this is caused by our app — the site behind the
tunnel is fine, and the same link works on desktop Chrome, where you click
Continue once and it sticks.

**Workaround, per device:** iPhone → Settings → Apps → Safari → *Prevent
Cross-Site Tracking* → **off**. Load the link, tap Continue once, then turn the
setting back on. This has to be done on every device, and it is not something
you can ask a client to do — which is why it is a workaround and not the fix.

**The fix:** use a tunnel provider with no interstitial. See *Sharing without an
interstitial* below.

## Sharing without an interstitial

`npm run share` runs a TryCloudflare quick tunnel:

```
tools/cloudflared.exe tunnel --no-autoupdate --url http://localhost:3100
```

No account, no login, no credentials file, and — the point — **no interstitial
and no cookie**, so there is nothing for iOS Safari to drop. The script refuses
to start if nothing is listening on the port, because a tunnel to a dead port
answers 502 to everything, which from a phone looks exactly like a broken
tunnel.

### The binary

`tools/cloudflared.exe` is a single portable Go binary from
<https://github.com/cloudflare/cloudflared/releases>. Nothing is installed
system-wide, nothing is on your PATH, and no admin rights were needed.
`tools/` is gitignored, so it never enters the repo. Removing it is deleting
that one file.

```
version   2026.10.7 (built 2026-10-30T09:43 UTC)
size      55,390,512 bytes (52.8 MB)
sha256    2493dbc168923bb3e59e5e7716f71deced92992eea9acd6e9d74f84ac7751343
```

That hash is worth keeping: cloudflared prints its own embedded build checksum
on startup (`Version 2026.10.7 (Checksum 2493dbc1…)`), and it matches the
SHA-256 of the file on disk. So the binary attests to its own integrity on every
run — compare the two if you ever re-download it.

To re-fetch or update it, replace the file deliberately:

```
curl -L -o tools/cloudflared.exe   https://github.com/cloudflare/cloudflared/releases/download/2026.10.7/cloudflared-windows-amd64.exe
```

### Why `--no-autoupdate`

cloudflared ships with a built-in updater that contacts
`update.argotunnel.com`, downloads a replacement binary (~53 MB) and swaps
itself, writing `cfd_update.bat`, `.new` and `.old` files next to the exe. That
is not something you want happening in the background in the middle of a
client demo. Cloudflare's own Docker image passes this same flag by default.

### It also lets the browser cache again

The Dev Tunnels relay rewrites every response to `no-store`, so nothing a
visitor loads can ever be reused. Cloudflare passes the origin's headers
through untouched. Same asset, same build, measured side by side:

```
cloudflare:  Cache-Control: public, max-age=31536000, immutable
devtunnels:  Cache-Control: no-cache,no-store
             Cache-Control: public, max-age=31536000, immutable
```

So a second page view, and every client-side navigation after the first, costs
the visitor almost nothing — which is the other half of why this feels like a
real site on a phone and the Ports panel does not.

### Caveats

- **The URL changes every run.** Quick tunnels are ephemeral by design. If you
  need a stable address, that is a named tunnel with a Cloudflare account, or a
  real preview deployment.
- **It dies with Ctrl-C.** The tunnel only lives as long as the command.
- **It is still a tunnel**, so it is slower than a real deployment. Serving the
  preview build rather than the dev server is what keeps it comfortable.

## If you do use VS Code's Ports panel anyway

### Port Visibility must be Public

VS Code forwards new ports as **Private** by default, and a Private forwarded
port demands a GitHub sign-in from whoever opens it. Anyone you share the link
with hits an authentication wall, which also looks like "it doesn't work".
Right-click the port row → **Port Visibility** → **Public**.

This resets per forwarded port, so check it every time you forward a new one.

## What was already configured, and kept

`allowedDevOrigins` in `next.config.ts` lists the tunnel hostnames
(`**.devtunnels.ms` and the common alternatives). This matters for the `npm run
dev` path: without it, Next answers 403 to every `/_next/*` request from a
non-localhost origin while still serving the HTML, so the page renders and
nothing hydrates — the same dead-page symptom, from a different cause. Verified
working: all 28 chunks return 200 to a tunnel origin.

`experimental.serverActions.allowedOrigins` carries the same hostnames. The
admin area (sign-in, post editor) runs on Server Actions, and Next rejects a
Server Action POST when the `Origin` header disagrees with `Host`. A tunnel
forwards its own hostname as `Host`, so the two already agree — this is
insurance against a relay that rewrites it, which would otherwise fail as
"Invalid Server Actions request" on every admin form and only through a tunnel.

---

## Fallback: same Wi-Fi, no tunnel

Useful when the tunnel is down or you want full speed on a phone. The dev server
already listens on every interface (`npm run dev` passes `-H 0.0.0.0`
explicitly). What blocks it is Windows Firewall, and the reason is worth
knowing:

Windows keeps three firewall profiles — Domain, Private and Public — and applies
whichever matches the network you are on. The "Node.js JavaScript Runtime" rules
Windows offers to create the first time you start a dev server are scoped to
**Private** only. This machine's Wi-Fi is classified **Public** (the default for
any network not explicitly marked private), and the Public profile blocks
inbound traffic. The server is running, the port is open, the phone is on the
same Wi-Fi — and every connection is dropped before Node sees it, with no error
message anywhere.

Run once, in an **elevated** PowerShell:

```
powershell -ExecutionPolicy Bypass -File scripts\enable-lan-testing.ps1
```

It creates inbound allow rules for TCP 3000 and 3001 on **all three profiles**,
each scoped with `-RemoteAddress LocalSubnet` so only devices on the same local
network can connect — plugging into café Wi-Fi does not expose your dev server,
your database credentials or your API keys to everyone on that network. That is
why this is better than marking every network Private or disabling the Public
profile.

To print the address to hand to the device (it changes with the DHCP lease, so
do not write it down):

```
npm run lan
```

That also reports whether the firewall rules are actually in place, since
without them the address is correct and still unreachable — which from the
phone's end is just a timeout.

To undo the rules:

```
powershell -File scripts\enable-lan-testing.ps1 -Remove
```
