# Security & Best Practices Checklist

This section maps to the rubric’s **Security & Best Practices (1 mark)**.

## Secrets handling

- ✅ No AWS keys, passwords, tokens committed to GitHub
- ✅ Use Jenkins Credentials OR IAM instance roles
- ✅ Keep `.env` files out of git (already in `.gitignore`)

## IAM least privilege

- ✅ Restrict permissions to only what is needed (example: only your S3 bucket)
- ✅ Prefer EC2 instance roles instead of long-term access keys

## Network security

- ✅ Only open ports you need:
  - Jenkins: 8080 from your IP
  - SSH: 22 from your IP (or from Jenkins SG for app instances)
  - App: 5000 only for demo (or behind ALB in real production)
- ✅ Avoid `0.0.0.0/0` on SSH

## Secure pipeline practices

- ✅ Don’t echo secrets into logs
- ✅ Use dedicated credentials IDs in Jenkins
- ✅ Keep deployment scripts minimal and auditable

## Backup / artifact strategy

- ✅ Store build artifacts in S3
- ✅ Keep at least a few previous artifacts (rollback option)
