# Demo Script (Git + CI/CD)

Use this to avoid forgetting steps during your demo/viva.

## Git demo (2–3 minutes)

1. Show branches: `main`, `develop`, `feature/*`
2. Show commit history (meaningful messages)
3. Show a merge into `develop` and then `main`
4. Show a tag on `main` (e.g., `v1.0.0`)

## CI/CD demo (3–5 minutes)

1. Push a commit to `feature/*` (CI runs)
2. Merge to `develop` → Jenkins deploys to DEV
3. Test endpoints on DEV
4. Merge to `main` → Jenkins deploys to PROD
5. Test endpoints on PROD

## API proof (use these endpoints)

- `POST /api/shorten` with `https://example.com`
- Open `/<code>` (shows redirect)
- `GET /api/stats/<code>` (hits increments)
- `GET /api/version` (shows version)
