# GitHub Actions CI/CD

This project now uses GitHub Actions for CI/CD. The workflow file is at `.github/workflows/main.yml`.

## Required repository secrets

Add these in your GitHub repo Settings → Secrets and variables → Actions:

- `SSH_PRIVATE_KEY` — the PEM private key (no passphrase) for SSH access to your EC2 instances.
- `SSH_USER` — SSH username (e.g. `ubuntu`).
- `DEV_HOST` — public IP or DNS of your DEV EC2 instance.
- `PROD_HOST` — public IP or DNS of your PROD EC2 instance.

Notes:

- The workflow uses `appleboy/ssh-action` to deploy via SSH and runs `./scripts/deploy_remote.sh` on the remote host. Ensure the target user can run that script and has necessary permissions.
- If you see a host key verification failure, the workflow is now configured to skip strict SSH host key checking.
- For least privilege, prefer using an IAM Role on the EC2 instance for S3 access rather than long-lived AWS keys.

## How the workflow works

- `push` to `develop` → `deploy-dev` job runs (after build-and-test) and deploys to `DEV_HOST`.
- `push` to `main` → `deploy-prod` job runs and deploys to `PROD_HOST`.

## To test locally before pushing

1. Run tests:

```bash
cd url-shortener
npm ci
npm test
```

2. Start the app locally to test the UI:

```bash
npm start
# open http://localhost:5000 in your browser
```

## To push these changes and trigger the workflow

Run:

```bash
git add .
git commit -m "CI: switch to GitHub Actions; add UI and docs"
git push origin develop
```

This will run the workflow for `develop` (build, test, package, deploy to DEV if secrets are configured).

## Safety

I will not stop or modify any AWS instances without your explicit confirmation. Deployment via Actions will SSH into the target hosts — please ensure the `SSH_PRIVATE_KEY` you store in GitHub matches the public key authorized on your EC2 instances.
