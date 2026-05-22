#!/usr/bin/env bash
set -euo pipefail

ARTIFACT_SOURCE="${1:?Usage: deploy_remote.sh <artifact_path_or_s3_uri> <app_name> <app_env>}"
APP_NAME="${2:?Usage: deploy_remote.sh <artifact_path_or_s3_uri> <app_name> <app_env>}"
APP_ENV="${3:?Usage: deploy_remote.sh <artifact_path_or_s3_uri> <app_name> <app_env>}"

APP_DIR="/opt/${APP_NAME}"
RELEASES_DIR="${APP_DIR}/releases"
CURRENT_LINK="${APP_DIR}/current"
DATA_DIR="${APP_DIR}/data"
DB_PATH="${DATA_DIR}/urls.json"
SERVICE_NAME="${APP_NAME}"

APP_USER="${SUDO_USER:-ubuntu}"
PORT="${PORT:-5000}"
HOST="${HOST:-0.0.0.0}"
APP_VERSION="${APP_VERSION:-}"
APP_BUILD="${APP_BUILD:-}"

log() {
  echo "[$(date -Is)] $*"
}

have_cmd() {
  command -v "$1" >/dev/null 2>&1
}

install_node_if_missing() {
  if have_cmd node && have_cmd npm; then
    return
  fi

  if ! have_cmd apt-get; then
    log "node and npm are required on the target server, and automatic installation is only supported on Ubuntu/Debian hosts."
    log "Install Node.js 22 LTS manually and retry."
    exit 1
  fi

  log "node/npm not found. Installing Node.js 22 LTS on the target server."
  apt-get update -y
  apt-get install -y ca-certificates curl
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
}

fetch_artifact_if_s3() {
  local source="$1"

  if [[ "$source" != s3://* ]]; then
    echo "$source"
    return
  fi

  if ! have_cmd aws; then
    log "Artifact is an S3 URI but aws CLI is not installed on this server."
    log "Either install aws CLI or deploy using a local file path (scp)."
    exit 1
  fi

  local tmp_tgz="/tmp/${APP_NAME}-${APP_ENV}.tgz"
  log "Downloading artifact from S3: $source"
  aws s3 cp "$source" "$tmp_tgz"
  echo "$tmp_tgz"
}

main() {
  if [[ $EUID -ne 0 ]]; then
    log "Please run with sudo (this script creates /opt/* and a systemd service)."
    exit 1
  fi

  install_node_if_missing

  local artifact_path
  artifact_path="$(fetch_artifact_if_s3 "$ARTIFACT_SOURCE")"

  if [[ ! -f "$artifact_path" ]]; then
    log "Artifact not found: $artifact_path"
    exit 1
  fi

  mkdir -p "$RELEASES_DIR"
  mkdir -p "$DATA_DIR"

  local release_dir
  release_dir="${RELEASES_DIR}/$(date +%Y%m%d%H%M%S)"
  mkdir -p "$release_dir"

  log "Extracting artifact to $release_dir"
  tar -xzf "$artifact_path" -C "$release_dir"

  if [[ -e "$CURRENT_LINK" && ! -L "$CURRENT_LINK" ]]; then
    rm -rf "$CURRENT_LINK"
  fi

  ln -sfn "$release_dir" "$CURRENT_LINK"

  chown -R "$APP_USER:$APP_USER" "$APP_DIR"

  log "Installing production dependencies"
  sudo -u "$APP_USER" env PATH="$PATH" bash -lc "cd '${CURRENT_LINK}' && npm ci --omit=dev"

  local service_file
  service_file="/etc/systemd/system/${SERVICE_NAME}.service"

  log "Writing systemd service: $service_file"
  cat >"$service_file" <<EOF
[Unit]
Description=${APP_NAME} (${APP_ENV})
After=network.target

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${CURRENT_LINK}
Environment=APP_ENV=${APP_ENV}
Environment=NODE_ENV=production
Environment=HOST=${HOST}
Environment=PORT=${PORT}
Environment=DB_PATH=${DB_PATH}
Environment=APP_VERSION=${APP_VERSION}
Environment=APP_BUILD=${APP_BUILD}
ExecStart=/usr/bin/env node ${CURRENT_LINK}/src/server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable "${SERVICE_NAME}" >/dev/null
  systemctl restart "${SERVICE_NAME}"

  log "Deployment complete. Service status:"
  systemctl status "${SERVICE_NAME}" --no-pager
}

main
