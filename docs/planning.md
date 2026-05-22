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

## CI/CD Pipeline (what to present)

- Source control: GitHub repository with branch-based flow
- CI trigger: push/PR to the repo
- Jenkins stages:
  1. Checkout
  2. Install Dependencies (`npm ci`)
  3. Test (`npm test`)
  4. Package release artifact
  5. Optional upload to S3
  6. Deploy to EC2 over SSH
- Deployment mapping:
  - `develop` → DEV EC2
  - `main` → PROD EC2
- Release behavior:
  - artifact contains the app code and production dependencies
  - EC2 deploy starts the systemd service using the packaged release

## Demo Script (simple order)

1. Explain the problem statement and goal
2. Show the architecture diagram and AWS resources
3. Walk through the branch strategy and CI/CD stages
4. Show Jenkins console output
5. Show the app running on EC2
6. Open `/health`, `/ui`, and `/api/version`
7. Close with security controls and lessons learned

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
- Create Jenkins pipeline stages (install, test, package, deploy)
- Add optional S3 artifact upload
- Link branch flow to DEV/PROD deployment

### Sprint 3 (AWS + Deployment)

- Create VPC + subnets + security groups
- Launch EC2 instances (Jenkins + DEV + PROD)
- Deploy and validate app access
- Verify app URLs, systemd service, and firewall rules

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
- Jenkins pipeline is green and documented
- Deployments visible on EC2 (service running + browser output)
- CI/CD flow can be explained clearly in the viva
- Documentation updated (report + screenshots)
