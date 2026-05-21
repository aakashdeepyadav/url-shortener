#!/usr/bin/env bash
set -euo pipefail

# EC2 User Data script for DEV/PROD app server (Ubuntu)
# Installs: Node.js (22 LTS)

export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get install -y ca-certificates curl gnupg

curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

node --version
npm --version

# Helpful info is available in /var/log/cloud-init-output.log
