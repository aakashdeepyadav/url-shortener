# Full-Marks Rubric Checklist (Target: 9–10/10)

Use this as your master checklist. For every item, capture **evidence** (screenshots, links) and mention it in your final report.

## Rubric → What to show

### 1) Project Planning & SDLC Understanding (1 mark)

✅ Evidence

- `docs/planning.md` completed (sprint plan + backlog + roles)
- In viva/demo: explain Agile vs DevOps and your workflow (feature → PR → CI → CD)

### 2) Git & Version Control Usage (2 marks)

✅ Evidence

- Branching: `main`, `develop`, `feature/*`
- Meaningful commits (not “update”)
- Versioning: `VERSION` file + a release tag (e.g., `v1.0.0`)
- At least 1 Pull Request with review + merge (screenshot)
- Show merge handling (optional but strong)

### 3) CI/CD Pipeline Implementation (2 marks)

✅ Evidence

- `Jenkinsfile` present in repo
- Jenkins stages: checkout → install → test → package → (optional S3 upload) → deploy
- Screenshot of successful pipeline run for `develop` and `main`

### 4) AWS Infrastructure Setup (2 marks)

✅ Evidence

- EC2: Jenkins server + App server(s) (DEV/PROD)
- IAM: least-privilege policy/role (screenshot + JSON in report)
- S3 bucket used (artifact storage / backups)
- VPC + subnet(s) + Security Groups (screenshots)
- In viva/demo: explain Public vs Private subnet

### 5) Deployment & Production Architecture (1 mark)

✅ Evidence

- Environment separation: `develop` deploys to DEV, `main` deploys to PROD
- Architecture diagram + explanation of how you’d add Load Balancer + Auto Scaling for HA

### 6) Security & Best Practices (1 mark)

✅ Evidence

- No secrets in repo (use Jenkins credentials / IAM roles)
- SG rules restricted (22 from your IP; app port only as needed)
- IAM least privilege shown
- Artifact/backup strategy via S3

### 7) Project Demonstration & Viva (1 mark)

✅ Evidence

- Live demo script (pipeline run + app working)
- Explain each stage confidently; show troubleshooting basics
- Prepare answers: `docs/viva-prep.md`

## “Excellent (9–10)” quick self-check

- Pipeline re-runs from scratch and deploys cleanly
- GitFlow + PRs demonstrated (not only direct pushes to main)
- AWS resources shown + why each exists
- You can explain design + security choices in 3–5 minutes
