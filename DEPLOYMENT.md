# KEE — Phase 1 Deployment Guide (Firebase Hosting demo link)

This covers exactly what's needed to get a **live, shareable demo link** with:
- Frontend on **Firebase Hosting**
- Backend (NestJS) + PostgreSQL unchanged, deployed to a host that runs
  long-lived Node processes and rewritten to under the same domain via
  Firebase Hosting's `/api/**` rewrite

No backend code changes are required for this phase. Two files were added
to the repo to make this possible: `backend/Dockerfile` and
`firebase.json`/`.firebaserc` at the repo root.

---

## 0. Important finding before you set anything up: you already have real OTP delivery

You asked about sending real OTPs via Firebase Auth. **You don't need
Firebase Auth for this** — `auth.service.ts` already has working SMTP
(email) and Twilio (SMS) integrations built in:

```
backend/src/auth/auth.service.ts
  SMTP_HOST / SMTP_USER / SMTP_PASS / SMTP_PORT / SMTP_FROM  → real email OTP
  TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER → real SMS OTP
```

Right now these env vars are unset, so it falls back to the `[KEE DEV]`
console-logged OTP I added last session. **Just set these env vars on your
backend host and OTPs will start sending for real — zero code changes.**

What you need to provide:
- **Email**: an SMTP account. Easiest options: a Gmail account with an
  [App Password](https://myaccount.google.com/apppasswords) (`smtp.gmail.com`,
  port 587), or a transactional provider like SendGrid/Mailgun/Brevo (all
  have free tiers, more reliable deliverability than Gmail for production).
- **SMS**: a [Twilio](https://www.twilio.com/) account — free trial credit
  to start, then pay-as-you-go. Note: Twilio trial accounts can only send
  SMS to phone numbers you've manually verified in the Twilio console —
  for unrestricted delivery to any Indian number you'll need to upgrade
  the account (this is a Twilio account limitation, not a KEE one) and may
  need to register an approved sender ID for India per TRAI regulations.

**If you'd rather use Firebase Auth for OTP instead**, know its real
limitations before switching:
- Firebase **Phone Auth** does send real SMS OTP codes, but requires the
  Blaze (pay-as-you-go) billing plan, reCAPTCHA/App Check verification on
  web, and has per-verification pricing once you're past the free quota.
- Firebase Auth has **no built-in numeric email OTP**. It offers
  password-based sign-in or "email link" (magic link) sign-in — a
  different UX than a 6-digit code. To keep your current numeric
  email-OTP flow you'd still need a custom email send (which you already
  have via SMTP/nodemailer).
- Switching to Firebase Auth also means re-plumbing your `role`/`shopId`
  JWT claims into Firebase custom claims, and rewriting every guard in
  `backend/src/common/`. That's Phase 2 scope, not a Phase 1 change.

**Recommendation**: set the SMTP + Twilio env vars now, keep your existing
auth system, revisit Firebase Auth only if OTP delivery becomes an
operational pain point later.

---

## 1. What only you can do (account/billing — I can't do these for you)

I can't create Google/Firebase accounts, click through billing setup, or
hold your API keys — that has to be you, in your own browser, with your
own Google account. Here's the exact list:

1. **Google account** — use an existing one or create one at
   [accounts.google.com](https://accounts.google.com).
2. **Firebase project** — go to
   [console.firebase.google.com](https://console.firebase.google.com) →
   "Add project" → name it (e.g. `kee-app`) → you can skip Google
   Analytics for now.
3. **Upgrade to the Blaze (pay-as-you-go) plan** — required for the
   Hosting → Cloud Run rewrite to work (Hosting's free Spark plan can
   only serve static files, not proxy to a backend). Blaze still has a
   generous free tier underneath; you only pay for usage beyond it.
   Firebase console → ⚙️ → **Usage and billing** → **Modify plan**.
4. **Pick where the backend + Postgres run** (pick ONE):
   - **Track A — Render or Railway (recommended for speed)**: sign up at
     [render.com](https://render.com) or [railway.app](https://railway.app)
     with GitHub. Both can build directly from `backend/Dockerfile`, both
     offer a managed Postgres add-on in the same dashboard, and neither
     needs `gcloud` installed locally. This is the fastest path to a
     working demo link today.
   - **Track B — Cloud Run + Cloud SQL (stays fully inside Google Cloud)**:
     needs the `gcloud` CLI installed locally (not currently installed on
     this machine), a Cloud SQL Postgres instance, and a VPC connector so
     Cloud Run can reach Cloud SQL privately. More setup, but keeps
     everything under one Google Cloud bill/console.
5. **Provide me the resulting values** once created (see §3 below) so I
   can wire up the config and deploy.
6. **(Optional) Custom domain** — if you own one, add it under Firebase
   Hosting → "Add custom domain" and you'll be given DNS records (an A
   record or TXT for verification, then A/CNAME for the live domain) to
   add at your domain registrar. Skip this entirely for the demo — the
   default `<project-id>.web.app` / `<project-id>.firebaseapp.com` URL
   Firebase gives you is a fully working shareable HTTPS link.

---

## 2. What I can do once you've done the above

- Run `firebase login` **on your machine** (opens your browser for you to
  authenticate — I never see or handle your Google password) — after
  that the CLI session is authenticated and I can run deploy commands via
  the terminal.
- Fill in the real project ID in `.firebaserc` and the real Cloud
  Run/Render service details in `firebase.json`.
- Build the frontend (`npm run build`) and deploy it: `firebase deploy --only hosting`.
- Deploy the backend container to whichever host you picked (Track A or B).
- Run the Prisma migration against your production Postgres instance
  (the Dockerfile already runs `prisma migrate deploy` on every boot, so
  this happens automatically on first deploy).
- Smoke-test the live URL end to end (login, OTP, dashboard, mobile
  layout) the same way I verified things locally this session.

---

## 3. Exact values I need from you

| # | Item | Where you get it | Goes where |
|---|---|---|---|
| 1 | Firebase project ID | Firebase console, top of project settings | `.firebaserc` |
| 2 | Backend host + region (Render/Railway URL, or Cloud Run service name + region) | Render/Railway dashboard after first deploy, or `gcloud run services describe` | `firebase.json` rewrite target |
| 3 | Production `DATABASE_URL` | Render/Railway Postgres add-on connection string, or Cloud SQL connection string | Backend host's env vars (never committed to git) |
| 4 | `JWT_SECRET` | Generate a new random 32+ char string for production — don't reuse the local dev one | Backend host's env vars |
| 5 | `ENCRYPTION_KEY` | Generate a new random 64-hex-char string for production — this encrypts sensitive ID numbers at rest, **losing/rotating it makes existing encrypted data unreadable**, so generate once and store it safely | Backend host's env vars |
| 6 | SMTP credentials (`SMTP_HOST/USER/PASS/PORT/FROM`) | Gmail App Password or SendGrid/Mailgun/Brevo API SMTP creds | Backend host's env vars |
| 7 | Twilio credentials (`TWILIO_ACCOUNT_SID/AUTH_TOKEN/PHONE_NUMBER`) | Twilio console | Backend host's env vars |
| 8 | (If using file uploads in production) object storage — see §4 below | — | — |

None of these need to be sent to me in chat — you can set them directly
in the Render/Railway/Cloud Run dashboard's environment variable section,
or paste them into a local `.env` file on this machine that I'll read
when configuring the deploy (it's already gitignored, so it won't get
committed).

---

## 4. One real technical issue you'll hit immediately — flagging before you test

`backend/src/customer/file.service.ts` currently saves uploaded customer
photos/signatures/documents to local disk (`public/uploads`). **Render,
Railway, and Cloud Run all run ephemeral, stateless containers** — any
file written to local disk is lost on every restart/redeploy, and isn't
shared if the service scales to more than one instance. This means the
camera capture / signature / ID document features would silently lose
data in this deployment, which defeats the point of testing them.

This is a small, contained fix (swap local `fs` calls in `file.service.ts`
for Firebase Storage or any S3-compatible bucket — roughly 20-30 lines of
code, isolated to one file) and I'd recommend doing it **before** you rely
on the demo link for testing document capture, rather than after. Let me
know and I'll implement it — this is the one place where Firebase Storage
becomes a near-requirement rather than a nice-to-have, even for Phase 1.

---

## 5. Step-by-step summary

1. You: create Firebase project, upgrade to Blaze.
2. You: sign up for Render/Railway (or set up Cloud SQL + enable Cloud Run
   API if going the gcloud route) and create a Postgres database there.
3. You: create SMTP + Twilio accounts, get credentials.
4. You: tell me to go ahead — say whether you want the Firebase Storage
   fix for uploads done first (recommended) — and run `firebase login` in
   a terminal on this machine so the CLI is authenticated.
5. Me: wire up `.firebaserc`/`firebase.json` with your real project ID and
   backend URL, set all env vars on the backend host, deploy backend
   container, deploy frontend to Firebase Hosting, run a live smoke test,
   hand you the URL.

Total turnaround once you've done steps 1-3: same day.
