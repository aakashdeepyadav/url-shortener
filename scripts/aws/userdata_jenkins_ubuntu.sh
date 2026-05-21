#!/usr/bin/env bash
set -euo pipefail

# EC2 User Data script for Jenkins server (Ubuntu)
# Installs: Git, Node.js (22 LTS), AWS CLI, Java 21, Jenkins

export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get install -y ca-certificates curl gnupg git

# Node.js 22 LTS (required for the pipeline)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# AWS CLI (required only if you enable S3 artifact uploads)
apt-get install -y awscli

# Java + Jenkins
# Jenkins 2.5xx requires Java 21+.
if ! apt-get install -y fontconfig openjdk-21-jre-headless; then
  echo "ERROR: Java 21 is required for Jenkins, but openjdk-21-jre-headless is unavailable on this Ubuntu image." >&2
  echo "Use an Ubuntu release that ships OpenJDK 21 (or install Java 21 via a supported source), then retry." >&2
  exit 1
fi

mkdir -p /usr/share/keyrings
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key | tee /usr/share/keyrings/jenkins-keyring.asc >/dev/null

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" \
  > /etc/apt/sources.list.d/jenkins.list

apt-get update -y
apt-get install -y jenkins

systemctl enable --now jenkins

# Helpful info is available in /var/log/cloud-init-output.log
