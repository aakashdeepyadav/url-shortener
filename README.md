# URL Shortener — DevOps Project (Jenkins + GitHub + AWS)

This is a minimal DevOps project designed to score **9–10/10** on the provided _DevOps Project Evaluation Rubrics (10 Marks)_.

## What you will build

- A tiny **URL Shortener** (Node.js + Express) with:
  - `POST /api/shorten` (create a short code)
  - `GET /:code` (redirect)
  - `GET /api/resolve/:code` (resolve without redirect)
  - `GET /api/stats/:code` (hits)
  - `GET /health`
  - `GET /ui` (simple frontend)
- Unit tests (`node --test`)
- A Jenkins pipeline (`Jenkinsfile`) that:
  - checks out code
  - installs dependencies
  - runs tests
  - packages a deployment artifact
  - (optional) uploads the artifact to S3
  - deploys to EC2 (DEV/PROD) based on branch (`develop` → DEV, `main` → PROD)

## Step-by-step to score full marks

1. Complete the rubric checklist: `docs/rubric-checklist.md`
2. Fill project planning + sprint plan: `docs/planning.md`
3. Use GitFlow-style workflow: `docs/git-workflow.md`
4. Create AWS infra (VPC, SG, EC2, IAM, S3): `docs/aws-setup.md`
5. Install/configure Jenkins + credentials: `docs/cicd-jenkins.md`
6. Demonstrate Git workflow with PRs:
   - `feature/*` → PR → `develop` (pipeline deploys to DEV)
   - `develop` → PR → `main` (pipeline deploys to PROD)
7. Capture required evidence + write report: `docs/submission-checklist.md` + `docs/report-template.md`
8. Prepare viva: `docs/viva-prep.md`

## Local run (Windows PowerShell)

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

## Local run (Linux/macOS)

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

## Key files

- `src/app.js`: Express app (API + redirect + `/ui`)
- `src/server.js`: server bootstrap
- `tests/app.test.js`: unit tests
- `Jenkinsfile`: CI/CD pipeline (assumes a Linux Jenkins agent)
- `scripts/deploy_remote.sh`: runs on the target EC2 to install deps + start a systemd service

## Important notes (for marks)

- Do **not** hardcode secrets. Use Jenkins Credentials and/or IAM instance roles.
- Keep security groups minimal (only required inbound ports).
- Security evidence checklist: see `docs/security.md`.
- Take screenshots of Jenkins runs, AWS resources, and your architecture diagram.
