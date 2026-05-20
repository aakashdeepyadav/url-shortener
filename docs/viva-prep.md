# Viva Preparation (Quick Answers)

Use these as speaking notes. Keep answers short and confident.

## 1) Difference between Agile and DevOps

- Agile is a **development methodology** (iterative sprints, backlog, continuous feedback).
- DevOps is a **culture + set of practices** that connects development and operations using automation (CI/CD) and shared ownership.

## 2) Explain CI/CD pipeline flow

- CI: code checkout → install dependencies → run tests → build/package artifact.
- CD: deploy artifact to target environment automatically (DEV/PROD).

## 3) Difference between Merge and Rebase in Git

- Merge creates a merge commit and preserves branch history.
- Rebase rewrites commit history to be linear; avoid rebasing shared branches.

## 4) What is Jenkinsfile?

- A pipeline-as-code file that defines the CI/CD stages and steps.

## 5) Difference between Public and Private Subnet

- Public subnet has a route to Internet Gateway; instances can reach/receive internet traffic.
- Private subnet has no direct internet route; used for internal resources.

## 6) What is a Load Balancer?

- Distributes traffic across multiple targets/instances to improve availability and scale.

## 7) Explain Auto Scaling

- Automatically increases/decreases instance count based on metrics (CPU, requests) to handle load.

## 8) Difference between Security Group and NACL

- Security Group: stateful, instance-level firewall.
- NACL: stateless, subnet-level rules.

## 9) What is Blue-Green Deployment?

- Two environments (blue and green). Deploy to the idle one, then switch traffic.

## 10) Explain High Availability Architecture

- Avoid single points of failure (multi-AZ, load balancer, auto scaling, health checks).
