# Security policy

## Reporting

Report security issues privately to the PracticeKoro maintainers. Do not include secrets,
personal information or working exploits in public GitHub issues.

## Credential rules

- Never commit credentials.
- Never expose server secrets through `VITE_` variables.
- Rotate a credential immediately if it appears in source, logs or screenshots.
- Keep demo mode disabled in production.

## Payment rules

- Create and verify payments server-side.
- Validate HMAC signatures, amount, currency, plan and order ownership.
- Make webhook reconciliation idempotent.
- Never activate a subscription from a client-only callback.

## Database rules

All user and admin data must be protected by RLS. `SECURITY DEFINER` functions must set a safe
`search_path`, validate `auth.uid()` and check the required role.

## Supported version

Security fixes are applied to the latest `main` branch.
