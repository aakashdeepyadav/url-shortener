# AWS + Jenkins Architecture

Use this diagram in your report and take a screenshot for submission.

## High-level flow

1. Developer pushes code to GitHub (feature branches + PRs)
2. GitHub webhook triggers Jenkins pipeline
3. Jenkins runs CI (install, test, package)
4. Jenkins optionally uploads the build artifact to S3
5. Jenkins deploys to EC2 via SSH
   - `develop` → DEV EC2
   - `main` → PROD EC2

## Mermaid diagram (paste into your report)

```mermaid
flowchart LR
  dev[Developer] -->|push / PR| gh[GitHub Repository]
  gh -->|webhook| jenkins[Jenkins (EC2)]

  subgraph AWS[AWS Cloud]
    subgraph VPC[VPC]
      jenkins
      s3[S3 Artifact Bucket]
      devEC2[DEV App EC2]
      prodEC2[PROD App EC2]
    end
  end

  jenkins -->|CI: test + package| jenkins
  jenkins -->|upload artifact| s3
  jenkins -->|deploy via SSH| devEC2
  jenkins -->|deploy via SSH| prodEC2

  user[User/Browser] -->|HTTP| devEC2
  user -->|HTTP| prodEC2
```

## Production architecture explanation (for the 1 mark)

- **Environment separation**: DEV and PROD are separate targets; deployments are branch-based.
- **High availability (concepts)**:
  - put app instances in an Auto Scaling Group across 2 AZs
  - place an Application Load Balancer in front
  - store logs/artifacts in S3
  - restrict SSH access and use IAM roles
