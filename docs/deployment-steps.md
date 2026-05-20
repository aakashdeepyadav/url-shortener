# Deployment Steps (End-to-End)

This is the flow you should explain during your demo.

## Branch-based environments

- `develop` branch deploys to **DEV** EC2
- `main` branch deploys to **PROD** EC2

## End-to-end flow

1. Developer pushes code to GitHub
2. GitHub webhook triggers Jenkins
3. Jenkins runs:
   - Install dependencies
   - Unit tests
   - Package artifact (`.tgz`)
   - Optional upload to S3
4. Jenkins deploys to EC2 via SSH:
   - uploads artifact to `/tmp/`
   - runs `scripts/deploy_remote.sh` with `sudo`
5. On EC2, the script:
   - extracts artifact to `/opt/<app>/releases/<timestamp>`
   - updates `/opt/<app>/current` symlink
   - keeps persistent data in `/opt/<app>/data/urls.json` (via `DB_PATH`)
   - installs production dependencies in the release (`npm ci --omit=dev`)
   - writes a systemd service (Node.js) and restarts it

## What to screenshot

- Jenkins console output showing stages
- SSH deploy stage output
- On EC2: `systemctl status <app>`
- Browser/API proof:
  - `/` (shows `environment`)
  - `/api/version` (shows version/build)
  - `POST /api/shorten` then open `/<code>`
  - `/api/stats/<code>`
