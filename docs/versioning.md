# Versioning & Releases

This project uses **Semantic Versioning**.

## Version source

- The canonical version is stored in the repository root: `VERSION`
- Jenkins sets `APP_VERSION` during builds and the app exposes it via `/api/version`

## Release workflow (demo-friendly)

1. Merge feature branches into `develop`
2. Open PR / merge `develop` → `main`
3. Tag the release on `main`:
   - `git tag -a v1.0.0 -m "Release v1.0.0"`
   - `git push --tags` (if using a remote)

## What to show (for marks)

- Git history with clean commit messages
- Tag `v1.0.0` on `main`
- Jenkins artifact name includes version + build number
- `/api/version` output in DEV and PROD
