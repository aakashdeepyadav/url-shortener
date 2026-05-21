# Jenkins CI/CD Setup (Jenkinsfile-based)

This matches the rubric requirement for Jenkins setup, automated build, testing stages, deployment automation, and Jenkinsfile usage.

## 1) Install Jenkins on EC2 (Ubuntu example)

High-level steps (capture screenshots during setup):

1. Launch an EC2 instance (Ubuntu) with port 8080 open from your IP
2. SSH into the instance
3. Install Java + Jenkins
4. Open Jenkins UI and complete initial setup

> If your course already provides Jenkins, skip installation and focus on pipeline configuration.

## 2) Jenkins plugins to install

- Git
- Pipeline
- Credentials
- SSH Agent (for SSH deploy)

## 3) Configure credentials (for security marks)

### SSH key to deploy to app EC2

- Create a Jenkins credential of type **SSH Username with private key**
- ID example: `ec2-ssh-key`
- Username: `ubuntu` (or your EC2 user)
- Private key: the key that can SSH into DEV/PROD app servers

### (Optional) AWS CLI access

Preferred: attach IAM Role to the Jenkins EC2 instance.
Alternative: store AWS keys in Jenkins credentials.

## 4) Create the pipeline job

Recommended: **Multibranch Pipeline**

- Connect it to your GitHub repo
- Add GitHub webhook so Jenkins triggers on push/PR

## 5) Configure `Jenkinsfile`

Open `Jenkinsfile` and replace:

- `AWS_REGION`
- `S3_BUCKET`
- `DEV_HOST` and `PROD_HOST`
- (if needed) branch names (`main`/`develop`)

Alternative (recommended): set Jenkins environment variables instead of editing the file:

- `AWS_REGION`
- `S3_BUCKET` (optional)
- `DEV_HOST`
- `PROD_HOST`
- `SSH_USER` (optional, default: `ubuntu`)
- `SSH_CREDENTIALS_ID` (optional, default: `ec2-ssh-key`)

Where to set them (pick one):

- Jenkins **Manage Jenkins → System → Global properties → Environment variables**
- Or at the **Folder** level (if you use folders)

This keeps secrets out of the repo and avoids hardcoding hostnames.

> Note: the pipeline uses Linux `sh` steps, so your Jenkins agent/controller should run on Linux.

## 6) What to demo (for full marks)

1. Show GitHub PR merge to `develop`
2. Show Jenkins pipeline stages
3. Show deployment to DEV (app runs)
4. Merge `develop` → `main`
5. Show Jenkins deploy to PROD (app runs)
