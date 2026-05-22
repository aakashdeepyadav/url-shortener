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

get_node_bin() {
  local bundled_node="${CURRENT_LINK}/.runtime/node/bin/node"

  if [[ -x "$bundled_node" ]]; then
    echo "$bundled_node"
    return
  fi

  if have_cmd node; then
    command -v node
    return
  fi

  log "No Node.js runtime found in the release artifact and no system node is available. Rebuild the artifact with scripts/package_release.sh."
  exit 1
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

  local node_bin
  local node_bin_dir
  node_bin="$(get_node_bin)"
  node_bin_dir="$(dirname "$node_bin")"

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
ExecStart=${node_bin} ${CURRENT_LINK}/src/server.js
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
