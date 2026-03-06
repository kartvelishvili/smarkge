# Smarketer — Digital Agency Website

React 18 + Vite + Supabase + Tailwind CSS

## Environment Setup

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

### Required Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public API key |

> **The app will throw a clear error on startup if these are missing.**

## Development

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:3000`.

## Admin Authentication

### Auth Flow

1. Navigate to `/paneli` to access the admin login page.
2. Enter your **Supabase Auth** email and password.
3. Supabase validates credentials via `signInWithPassword()`.
4. On success, the app stores a Supabase session (managed by `@supabase/supabase-js` — **not** localStorage tokens).
5. The `ProtectedAdminRoute` component guards `/paneli/dashboard`:
   - Checks for a valid Supabase session.
   - Checks for an admin role via `user.app_metadata.role` or `user.user_metadata.role`.
   - If no role system is configured yet, any authenticated Supabase user is allowed (migration-friendly).
6. Logout calls `supabase.auth.signOut()` and redirects to `/paneli`.

### Creating an Admin User

Create a user in [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → Users, then optionally set their role:

```sql
-- In Supabase SQL Editor:
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb 
WHERE email = 'your-admin@example.com';
```

### Login Lockout Policy

| Rule | Value |
|---|---|
| Max failed attempts | 5 |
| Lockout duration | 15 minutes |
| Storage | Client-side (localStorage timestamps) |
| Reset | Automatically after lockout window passes, or on successful login |

After 5 failed login attempts, the login form is disabled and shows a countdown timer. This is a client-side rate limit to deter brute-force attacks. For production, also enable Supabase's built-in rate limiting on the Auth API.

### Session Expiry

- Admin sessions have a **24-hour inactivity timeout**.
- Activity is tracked via mouse, keyboard, scroll, and touch events.
- After 24 hours of no activity, the user is automatically signed out and redirected to `/paneli`.
- The inactivity timer persists across page refreshes (stored in localStorage).

## Build

```bash
npm run build
```

Output is in the `dist/` directory.
