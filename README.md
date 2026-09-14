# PracticeKoro 2.0

PracticeKoro is a bilingual mock-test and practice platform for West Bengal competitive
examinations. It includes student test-taking workflows, topic-wise practice, results and
solutions, subscriptions, and an administration CMS.

## Stack

- React, TypeScript, Vite and Tailwind CSS
- Supabase Auth, PostgreSQL, RLS and Edge Functions
- TanStack Query
- Razorpay
- Vitest, Testing Library and Playwright

## Local setup

1. Install Node.js 22 or newer.
2. Copy `.env.example` to `.env.local`.
3. Add the public Supabase URL and anonymous key.
4. Install dependencies and start the app:

```bash
npm ci
npm run dev
```

Never add the Supabase service-role key, Razorpay key secret, or webhook secret to a
`VITE_` environment variable.

## Commands

| Command                 | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start the development server             |
| `npm run build`         | Type-check and create a production build |
| `npm run lint`          | Run ESLint                               |
| `npm run format:check`  | Verify formatting                        |
| `npm test`              | Run unit tests                           |
| `npm run test:coverage` | Run unit tests with coverage             |
| `npm run test:e2e`      | Run Playwright tests                     |
| `npm run check`         | Run all pull-request quality checks      |

## Supabase

Apply migrations in numeric order from `supabase/migrations`. Review every migration before
running it against production and take a database backup first.

Deploy Edge Functions with the Supabase CLI and configure server-only secrets in the Supabase
project:

```bash
supabase secrets set RAZORPAY_KEY_SECRET=... RAZORPAY_WEBHOOK_SECRET=...
supabase functions deploy verify-payment
supabase functions deploy razorpay-webhook --no-verify-jwt
```

Webhook endpoints intentionally verify Razorpay's HMAC signature. Do not add fallback secrets.

## Deployment

Build with `npm run build` and publish the `dist` directory. The host must rewrite unknown
client routes to `/index.html` for React Router. See [the deployment guide](docs/DEPLOYMENT.md).

## Testing payments

Use a Razorpay test account and Supabase staging project. Do not run automated tests against
live payment credentials. Verify successful, failed, duplicate, amount-mismatch and
signature-mismatch scenarios before launch.

## Security

Read [SECURITY.md](SECURITY.md). Report vulnerabilities privately rather than opening a public
issue containing exploit details or credentials.
