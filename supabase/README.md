# Supabase setup

1. Create a hosted Supabase project, then run `npx supabase login` and
   `npx supabase link --project-ref <project-ref>`.
2. Run `npx supabase db push` to apply the SQL migrations in this directory.
3. In Authentication providers, enable Phone, Email, and Google. Configure the
   Google redirect URL as `go-snooze://auth/callback` plus the Expo development
   redirect URL used by the app.
4. Configure a supported SMS provider, OTP limits, expiry, and CAPTCHA in the
   Supabase dashboard. Provider credentials belong only in Supabase secrets.
5. Copy `.env.example` to `.env` and add the project's URL and *publishable*
   key. Never use a service-role key in the mobile app.
6. Configure the protected transit proxy and deploy it:

   ```sh
   supabase secrets set GO_TRANSIT_API_BASE_URL=... GO_TRANSIT_API_KEY=... \
     GO_TRANSIT_TRAIN_LINES=... GO_TRANSIT_LINE_STOPS=... \
     GO_TRANSIT_STOP_INFO=... GO_TRANSIT_SERVICE_ALERTS=...
   supabase functions deploy transit-proxy
   ```

7. Verify the RLS policies with two different test accounts before production.

The migration creates a public profile-avatar bucket intentionally: profile
image URLs are displayed to other signed-in users. Upload, overwrite, and
delete access remains limited to a path beginning with the authenticated user
ID. Change the bucket to private and issue signed URLs if avatars must not be
publicly readable.
