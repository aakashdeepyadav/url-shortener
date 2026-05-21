# Security & Best Practices Checklist

This section maps to the rubric’s **Security & Best Practices (1 mark)** and documents what is actually used in this repository.

## Secrets handling (implemented)

- ✅ No AWS keys, passwords, or tokens committed to GitHub
- ✅ `.env` / `.env.*` are ignored (see `.gitignore`)
- ✅ Deployment SSH key is stored in **Jenkins Credentials** (see `SSH_CREDENTIALS_ID` in `Jenkinsfile`)
- ✅ AWS access (if used) should be via **EC2 IAM Role** (preferred) or Jenkins Credentials (never stored in code)

## IAM least privilege (AWS)

- ✅ Least-privilege example policy (S3-only for artifact bucket) is included in `docs/aws-setup.md`
- ✅ Prefer an EC2 instance role for the Jenkins EC2 instance to avoid long-term access keys

## Network security (AWS)

- ✅ Jenkins SG inbound (minimum):
  - TCP 22 (SSH) from **your IP**
  - TCP 8080 (Jenkins UI) from **your IP**
- ✅ App SG inbound (minimum):
  - TCP 22 (SSH) **from Jenkins SG** (so only Jenkins can deploy)
  - TCP 5000 (app) from **your IP** (or tighter, depending on demo)
- ✅ Avoid `0.0.0.0/0` on SSH

## Secure pipeline practices (implemented)

- ✅ Uses `sshagent` with a credential ID (private key never stored in repo)
- ✅ Artifact names include version + build number (traceability/rollback)
- ⚠️ Demo simplification: `StrictHostKeyChecking=no` is used in the `Jenkinsfile` to avoid interactive SSH prompts. For a production-grade setup, pin server host keys in `known_hosts`.

## Application-level security (implemented)

- ✅ Input validation: only `http://` / `https://` URLs are accepted (rejects `javascript:` etc.)
- ✅ Secure short-code generation using `crypto.randomBytes`
- ✅ Request size limits: JSON body is capped at `32kb`
- ✅ URL length capped at `2048` characters
- ✅ Basic HTTP hardening:
  - Disables `X-Powered-By`
  - Sets security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, etc.)

## Backup / artifact strategy

- ✅ Optional: Upload build artifacts to S3 for simple rollback (keep previous artifacts)
