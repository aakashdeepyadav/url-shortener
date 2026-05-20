# Project Planning (Agile + DevOps)

## Project Title

CI/CD Pipeline for a Node.js Web App using Jenkins + GitHub + AWS (EC2, S3, IAM, VPC)

## Objective

Build and demonstrate an industry-style DevOps workflow:

- plan work in sprints
- collaborate using Git branching + PRs
- automate CI (build/test/package)
- automate CD (deploy to AWS EC2)
- follow security best practices

## SDLC & Workflow (what to explain in viva)

- **Agile**: short iterations (sprints), backlog, incremental delivery
- **DevOps**: collaboration between dev + ops with automation (CI/CD)
- Workflow used here:
  1. Create feature branch
  2. Push commits + open PR
  3. Jenkins runs CI on PR/branch
  4. Merge to `develop` → deploy to DEV
  5. Merge `develop` to `main` → deploy to PROD

## Sprint plan (suggested)

### Sprint 0 (Planning)

- Choose project
- Define architecture + AWS services
- Create repo + branch strategy

### Sprint 1 (Git + App)

- Create Node.js + Express app + health endpoint
- Add unit tests
- Establish commit conventions

### Sprint 2 (CI/CD)

- Install/configure Jenkins
- Create Jenkins pipeline stages (test + package)
- Add automated deployment step

### Sprint 3 (AWS + Deployment)

- Create VPC + subnets + security groups
- Launch EC2 instances (Jenkins + DEV + PROD)
- Deploy and validate app access

### Sprint 4 (Security + Documentation + Demo)

- IAM least privilege
- Remove any hardcoded secrets
- Prepare report, diagram, screenshots, PPT
- Viva preparation + demo rehearsal

## Backlog (example user stories)

- As a user, I can open the app homepage and see environment info.
- As an engineer, I can check service health via `/health`.
- As a DevOps engineer, I can run tests automatically on each push.
- As a DevOps engineer, I can deploy to DEV automatically from `develop`.
- As a DevOps engineer, I can deploy to PROD automatically from `main`.

## Definition of Done

- Tests passing (`npm test`)
- Jenkins pipeline is green
- Deployments visible on EC2 (service running + browser output)
- Documentation updated (report + screenshots)
