# URL Shortener

A small URL shortener service built with Node.js + Express.

It includes a Jenkins CI/CD pipeline (`Jenkinsfile`) and an EC2 deployment script (`scripts/deploy_remote.sh`) to support automated deployments (with optional artifact storage in S3).

## Features

- API endpoints:
  - `POST /api/shorten` (create a short code)
  - `GET /:code` (redirect)
  - `GET /api/resolve/:code` (resolve without redirect)
  - `GET /api/stats/:code` (hits)
  - `GET /health`
  - `GET /api/version`
- Minimal frontend at `GET /ui`
- JSON file persistence with hit counting
- Automated tests (`node --test`)

## Quickstart (Windows PowerShell)

```powershell
cd url-shortener
npm install
npm test
$env:APP_ENV = "dev"
npm start
```

Then open:

- http://localhost:5000/ui
- http://localhost:5000/health

Example shorten request:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/shorten -ContentType application/json -Body '{"url":"https://example.com"}'
```

## Quickstart (Linux/macOS)

```bash
cd url-shortener
npm install
npm test
APP_ENV=dev npm start
```

## Configuration (environment variables)

- `APP_ENV`: `dev` / `prod` (default: `dev`)
- `PORT`: server port (default: `5000`)
- `HOST`: bind host (default: `0.0.0.0`)
- `DB_PATH`: path to JSON store file (default: `./data/urls.json`)
- `SHORT_CODE_LENGTH`: short code length (4–16, default: `6`)
- `APP_VERSION` / `APP_BUILD`: set by Jenkins and exposed via `GET /api/version`

## CI/CD and deployment

- Pipeline: `Jenkinsfile`
  - install deps → test → package → (optional) upload to S3 → deploy to EC2
- Remote deploy script: `scripts/deploy_remote.sh`
  - bootstraps Node.js 22 LTS on Ubuntu/Debian hosts if `node`/`npm` are missing
  - installs production deps
  - writes a systemd service
  - keeps data under `/opt/<app>/data`

Recommended branch flow:

- `feature/*` → PR → `develop` (deploy to DEV)
- `develop` → PR → `main` (deploy to PROD)

## Documentation

- API: `docs/api.md`
- Architecture: `docs/architecture.md`
- AWS setup (VPC/SG/EC2/IAM/S3): `docs/aws-setup.md`
- Jenkins setup: `docs/cicd-jenkins.md`
- Deployment steps: `docs/deployment-steps.md`
- Security: `docs/security.md`
- Versioning: `docs/versioning.md`

## Key files

- `src/app.js`: Express app (API + redirect + `/ui`)
- `src/server.js`: server bootstrap
- `tests/app.test.js`: unit tests
- `Jenkinsfile`: CI/CD pipeline (assumes a Linux Jenkins agent)
- `scripts/deploy_remote.sh`: runs on the target EC2 to install deps + start a systemd service

## Security notes

- Do not hardcode secrets. Use Jenkins Credentials and/or IAM instance roles.
- Keep security groups minimal (only required inbound ports).
- See `docs/security.md` for the implemented controls and checklist.
