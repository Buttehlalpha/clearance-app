# Campus Clearance System

A React (Vite) + Supabase implementation of a five-stage student clearance
workflow: Bursary → Library → Hostel → Department Head → Student Affairs,
with automatic certificate issuance and public certificate verification.

## Stack

- **Vite + React 18**, plain JS, Tailwind CSS, React Router v6, framer-motion
- **Supabase** — auth, Postgres, row-level security, all workflow logic
  enforced with database triggers (not just the frontend)

## Already set up for you

This project's Supabase backend (`campus-clearance-system`) is **already
live and fully configured** — schema, roles, the 5-stage workflow,
certificate auto-issuance, and row-level security are all in place and
tested. The `.env` file in this zip already has the real project
credentials filled in. You only need to do the steps below.

## 1. Turn off email confirmation (do this first)

Supabase confirms new signups by email by default, which needs a working
redirect URL and a connected mail sender — neither of which exist yet for
a fresh project, so sign-up will fail or dead-end. Turn it off:

1. Open **[Authentication → Providers → Email](https://supabase.com/dashboard/project/blwxvmgvjifxxkryriob/auth/providers)**
2. Click into **Email**, turn **off** "Confirm email", save

With it off, `supabase.auth.signUp()` returns a live session immediately —
sign up and you're straight into your dashboard, no email step. (Turn this
back on later if you deploy somewhere real people will use, and set a
proper **Site URL** under URL Configuration at the same time.)

## 2. Install and run

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. The terminal will also print a
**Network** URL (e.g. `http://192.168.x.x:5173`) — open that from your
phone or another device on the same Wi-Fi to test there too.

## 3. How accounts and roles work

- **Students** sign up themselves on `/signup` — full name, matric number,
  department, faculty, level, email, password. They always land as
  `student`, and go straight to their dashboard.
- **Officers and administrators can never self-register as such** — this
  is enforced in the database, not just hidden in the UI. The sign-up form
  only ever creates students.
- To create your **first administrator**: sign up a normal account through
  the app, then in Supabase go to **[Table Editor → profiles](https://supabase.com/dashboard/project/blwxvmgvjifxxkryriob/editor)**,
  find that row, and change `role` to `administrator`.
- From then on, that administrator can promote anyone to `officer` (and
  assign which stage they handle: bursary / library / hostel /
  department_head / student_affairs) or `administrator`, from the
  **User Management** screen in the app — no database editing needed again.

## 4. The workflow, in one paragraph

A student clicks **Start Clearance**, which creates one application and
five pending review rows (one per stage) automatically. An officer only
sees applications in their queue once every *earlier* stage is approved —
this order is enforced by the database itself, so it can't be bypassed by
calling the API directly. Once all five stages are approved, the
application is marked **cleared** and a certificate (reference number +
verification code) is issued automatically. The student can then submit an
**exit request** (blocked until clearance is complete) and print/download
their certificate.

## 5. Certificate verification

`/verify` is a **public page — no login required**. Anyone can enter a
certificate reference or verification code to check it's genuine. This
works by design for anon visitors (an employer checking a certificate
isn't a student or staff account) — the certificates table stores the
student's name and matric number directly, so this page never needs
broader access to your student records.

## 6. Build and deploy

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

Deploying to Vercel (or Netlify, etc.): set these two environment
variables in your hosting provider's project settings — they are **not**
read from the `.env` file once deployed (that file isn't pushed to git):

```
VITE_SUPABASE_URL=https://blwxvmgvjifxxkryriob.supabase.co
VITE_SUPABASE_ANON_KEY=<see your .env file>
```

Once it's live on a real domain, go back to **Authentication → URL
Configuration** in Supabase and set the **Site URL** to that domain (and
add it under Redirect URLs) — otherwise any email links (password reset,
confirmation if you turn it back on) will point at `localhost`.

## Notes

- If you hit **"email rate limit exceeded"** while testing password reset
  or similar, that's Supabase's shared free-tier mail sender — it resets
  within about an hour, or connect your own SMTP (Resend, Brevo, etc.)
  under Authentication → Emails → SMTP Settings to lift it permanently.
- RLS is enforced throughout — students can only see their own
  application; officers see applications once ready for their stage;
  administrators see everything and manage roles.
