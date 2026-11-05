# Payments — Paystack

Paystack is the only payment gateway. There is no Stripe or Flutterwave code
anywhere in the project; the site copy that used to name them has been corrected
to say Paystack.

## 1. Add your keys

Copy `.env.example` to `.env.local` if you have not already, then fill in:

```
PAYSTACK_SECRET_KEY=sk_test_…
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_…
```

Both come from <https://dashboard.paystack.com/#/settings/developers>.

Use a **matched pair** — a test secret with a live public key (or the reverse)
fails at checkout with an unhelpful error from Paystack. Restart the dev server
afterwards; Next reads env files at startup, not per request.

While the secret key starts with `sk_test_`, `/pay` shows a **Test mode**
banner, so a test payment can never be mistaken for a real one. Swapping both
keys to `sk_live_…` / `pk_live_…` is the whole of going live.

The secret key is validated on read: a public key in the secret slot, or a
value that is not a Paystack key at all, produces a clear error instead of an
opaque 401 from the gateway.

## 2. Create the payments table

```
npx drizzle-kit push
```

Reads `src/db/schema.ts` and adds the new `payments` table. Safe to re-run —
it only creates what is missing. (Same command as step 2 of README-ADMIN.md.)

## 3. Set the webhook (production only)

On the Paystack dashboard, Settings → API Keys & Webhooks, set the webhook URL
to:

```
https://your-domain.com/api/payments/webhook
```

Paystack has to reach this from the public internet, so **leave it unset while
developing** — `localhost` and a LAN address are not routable from Paystack's
servers. Payments still confirm correctly in development, because the callback
page verifies them too (see below).

---

## How a payment flows

```
  /pay  ──POST /api/payments/initialize──►  pending row written, then Paystack
                                            returns a checkout URL
    │
    ▼
  checkout.paystack.com  (card / transfer / USSD / mobile money)
    │
    ├──browser redirect──►  /pay/callback?reference=…   ─┐
    │                                                     ├─►  settlePayment()
    └──server webhook────►  /api/payments/webhook       ─┘      verifies + records
```

Three things are deliberate:

**The pending row is written before Paystack is called.** If the response is
lost, the transaction still exists under a reference we own, so the webhook can
settle it and it appears in reconciliation. The other order means a customer can
be charged against a reference that exists nowhere in our database.

**Both the redirect and the webhook settle through one function.** Either can
arrive first, both usually arrive, and in development only the redirect ever
does. `settlePayment()` is idempotent, so a row already marked `success` is not
re-settled and `paidAt` keeps the moment the money actually moved.

**Nothing is marked paid on the strength of a redirect.** The callback URL
carries a reference in a query string that anyone can edit, so the server always
re-asks the Paystack API what the transaction is, and compares the amount
charged against the amount invoiced. A mismatch is recorded and never reported
as paid.

## Why the amount is typed in by the customer

`/pricing` publishes starting prices and the payment terms: 50% to begin, 30% at
draft delivery, 20% on final delivery — against a **written itemised quote**
issued after a free consultation. The site therefore cannot compute an
instalment, because it does not know the agreed total. Asking the customer for
the figure they were quoted is honest; inventing a percentage of a price they
have not agreed to would not be.

The server bounds it (₦1,000 – ₦5,000,000, at most two decimal places) using
the same schema the form uses, so a hand-crafted request cannot charge an
arbitrary figure either.

## Money is never a float

Paystack charges and reports in **kobo**, as an integer, and the `payments`
table stores kobo in `amount_subunit`. The figure in that column is therefore
byte-identical to the figure on the Paystack dashboard, with no decimal
conversion to disagree about during a chargeback. Naira ⇄ kobo conversion lives
in exactly two functions, `toSubunit` and `fromSubunit`.

## Files

| Path | Role |
|---|---|
| `src/lib/payments/paystack.ts` | Gateway client: initialize, verify, webhook signature, money conversion |
| `src/lib/payments/settle.ts` | Turns a verified gateway result into our rows. Idempotent |
| `src/lib/payments/options.ts` | Validation schema and instalment vocabulary, shared by form and server |
| `src/lib/site-url.ts` | Derives the callback URL from the live request |
| `src/app/api/payments/initialize/route.ts` | Starts a checkout |
| `src/app/api/payments/webhook/route.ts` | Paystack's authoritative notification |
| `src/app/pay/page.tsx` | The payment page |
| `src/app/pay/callback/page.tsx` | Verifies and shows the receipt |
| `src/components/payments/PaymentForm.tsx` | The form |

## Testing it

Use Paystack's test cards: <https://paystack.com/docs/payments/test-payments>

- `4084 0840 8408 4081` — succeeds (any future expiry, any CVV, OTP `123456`)
- `5060 6666 6666 6666 666` — insufficient funds, to check the failure screen

A test payment walks the whole path: pending row, checkout, redirect,
verification, receipt. The `/pay/callback` page handles success, failure,
still-processing, an unrecognised reference and a gateway that cannot be
reached — each with its own copy, because "payment failed" is the wrong thing
to tell someone whose money may have moved.

### No webhook needed in development

The callback page verifies the transaction itself, so payments confirm on this
machine with no public URL and no tunnel pointed at the webhook. The webhook
matters in production, for the customer who closes the tab on their bank's 3-D
Secure page or pays by transfer an hour later.

### Paying from a phone

The Paystack `callback_url` is derived from the request the customer is actually
browsing on, not from a constant — see `src/lib/site-url.ts`. A payment started
on a phone therefore returns to that phone. Setting `NEXT_PUBLIC_SITE_URL`
locally would break this: the phone would be sent to `http://localhost:3000`,
which on a phone means *the phone itself*. Set it in production only.
