# Supabase setup

The app will not boot until steps 1–3 are done — `src/backend/supabase.ts`
throws if the env vars are missing.

### Prerequisites
- A hosted Supabase project (create one at supabase.com).
- The Supabase CLI: `npm i -g supabase` (or use `npx supabase ...`).

### 1. Link the project and apply the schema
```sh
supabase login
supabase link --project-ref <your-project-ref>
supabase db push            # applies migrations/ (tables, RLS, storage bucket)
```

### 2. Add the client env vars
Copy `.env.example` to `.env` in the repo root and fill in:
```sh
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```
Use the **publishable** (anon) key only. Never put a service-role key in the app.

### 3. Configure Auth providers (dashboard → Authentication)
- Enable **Phone**, **Email**, and **Google**.
- Google redirect URLs: `go-snooze://auth/callback` plus the Expo dev URL.
- Under **Phone**, configure an SMS provider (e.g. Twilio) and set OTP
  expiry, rate limits, and CAPTCHA. Provider credentials live in Supabase
  secrets, never in the app.

### 4. Deploy the transit proxy (keeps the GO Transit key server-side)
```sh
supabase secrets set GO_TRANSIT_API_BASE_URL=... GO_TRANSIT_API_KEY=... \
  GO_TRANSIT_TRAIN_LINES=... GO_TRANSIT_LINE_STOPS=... \
  GO_TRANSIT_STOP_INFO=... GO_TRANSIT_SERVICE_ALERTS=...
supabase functions deploy transit-proxy
```

### 5. Run the app
```sh
npm install
npx expo start        # or a dev build for background location — see main README
```

### Verify before production
- Sign in with two different accounts and confirm RLS isolates their rows.
- The migration creates a **public** `profile-images` bucket on purpose
  (avatars are shown to other signed-in users); write/delete stays scoped to a
  path prefixed with the owner's user id. Switch it to private + signed URLs if
  avatars must not be publicly readable.
