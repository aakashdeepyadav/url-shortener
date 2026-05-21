#!/usr/bin/env bash
set -euo pipefail

# EC2 User Data script for Jenkins server (Ubuntu)
# Installs: Git, Node.js (22 LTS), AWS CLI, Java 17, Jenkins

export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get install -y ca-certificates curl gnupg git

# Node.js 22 LTS (required for the pipeline)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# AWS CLI (required only if you enable S3 artifact uploads)
apt-get install -y awscli

# Java + Jenkins
apt-get install -y fontconfig openjdk-17-jre

curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | tee /usr/share/keyrings/jenkins-keyring.asc >/dev/null

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" \
  > /etc/apt/sources.list.d/jenkins.list

apt-get update -y
apt-get install -y jenkins

systemctl enable --now jenkins

# Helpful info is available in /var/log/cloud-init-output.log
