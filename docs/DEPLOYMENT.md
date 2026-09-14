# Deployment guide

## Environments

Use separate Supabase and Razorpay projects for development, staging and production. Store
server credentials only in Supabase Edge Function secrets or the deployment platform's secret
store.

## Build

```bash
npm ci
npm run check
npm run build
```

Publish the generated `dist` directory.

## Required public variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_RAZORPAY_KEY_ID`

Values prefixed with `VITE_` are included in the browser bundle and must never contain secrets.

## Required Edge Function secrets

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

## Hostinger SPA routing

Configure the web root so existing files are served normally and all other routes are rewritten
to `/index.html`. Confirm direct navigation to `/practice`, `/tests/:id` and `/admin` works after
deployment.

## Release checklist

1. Back up the production database.
2. Apply reviewed migrations.
3. Deploy Edge Functions.
4. Run staging smoke tests and Razorpay test-mode scenarios.
5. Run `npm audit --omit=dev`.
6. Deploy `dist`.
7. Verify authentication, one free test, one premium test and webhook reconciliation.
8. Monitor Edge Function and database logs without logging personal data or credentials.

## Rollback

Keep the previous `dist` artifact and deployment available. Database changes require an
explicit, reviewed down-migration or point-in-time recovery; never improvise destructive SQL in
production.
