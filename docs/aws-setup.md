# AWS Setup (EC2, IAM, S3, VPC, Security Groups)

This guide is written to match the rubric items for AWS + networking.

## 1) VPC (recommended for full marks)

1. Create a VPC (example CIDR: `10.0.0.0/16`)
2. Create **two public subnets** (example: `10.0.1.0/24`, `10.0.2.0/24`) in different AZs
3. Create and attach an **Internet Gateway** to the VPC
4. Create a **Route Table** with `0.0.0.0/0 → Internet Gateway` and associate it with the public subnets

> If your faculty allows using the default VPC, you can use it, but a custom VPC is better for marks.

## 2) Security Groups (SG)

### SG: Jenkins Server

Inbound (minimum):

- TCP 22 (SSH) from **your IP**
- TCP 8080 (Jenkins UI) from **your IP**
  Outbound: allow all (default) or restrict as needed

### SG: App Server (DEV/PROD)

Inbound (minimum):

- TCP 22 (SSH) **from the Jenkins SG** (so only Jenkins can deploy)
- TCP 5000 (app) from **your IP** (or from anywhere for demo)

## 3) EC2 instances

Create 2–3 instances:

- `jenkins-ec2` (Ubuntu recommended)
- `app-dev-ec2`
- `app-prod-ec2`

Notes:

- Put all instances in the VPC public subnet(s)
- Use the correct SG for each instance
- Create/download a key pair to connect via SSH

### Install Node.js on Jenkins + App instances (required)

Your pipeline and deploy script expect **Node.js + npm** on:

- Jenkins EC2 (to run `npm ci` + `npm test`)
- DEV/PROD EC2 (to run the systemd service)

On Ubuntu, one simple approach (Node 22 LTS):

```bash
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl

curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

node --version
npm --version
```

### Optional: automate installs using EC2 User Data

If you want fewer manual steps, you can paste these scripts into **EC2 → Advanced details → User data** when launching instances:

- Jenkins EC2: `scripts/aws/userdata_jenkins_ubuntu.sh`
- DEV/PROD EC2: `scripts/aws/userdata_app_ubuntu.sh`

After the instance boots, you can review output via:

```bash
sudo tail -n 200 /var/log/cloud-init-output.log
```

## 4) S3 bucket (artifact storage)

1. Create an S3 bucket (unique name)
2. Keep it private
3. Your Jenkins pipeline can upload build artifacts to this bucket

## 5) IAM (least privilege)

Best practice options:

### Option A (best): IAM Role for Jenkins EC2

- Create an IAM role for EC2 with permissions limited to your S3 bucket
- Attach it to `jenkins-ec2` (instance profile)
- Jenkins can run `aws s3 cp ...` without storing long-term access keys

Example least-privilege policy (replace bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ArtifactBucketAccess",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME",
        "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      ]
    }
  ]
}
```

### Option B: IAM User + Access Keys (acceptable)

- Store keys in **Jenkins Credentials** (not in code)
- Still use least privilege

## 6) Evidence to capture (for marks)

- EC2 instance list
- VPC + subnet screenshots
- Security Group inbound rules screenshot
- S3 bucket showing uploaded artifacts
- IAM role/user policy screenshot
