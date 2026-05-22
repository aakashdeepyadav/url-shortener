#!/usr/bin/env bash
set -euo pipefail

ARTIFACT_DIR="${1:-dist}"
ARTIFACT_NAME="${2:-url-shortener.tgz}"
NODE_RUNTIME_VERSION="${NODE_RUNTIME_VERSION:-22.16.0}"
NODE_RUNTIME_DIR=".runtime/node"

log() {
  echo "[$(date -Is)] $*"
}

detect_node_arch() {
  case "$(uname -m)" in
    x86_64|amd64)
      echo "x64"
      ;;
    aarch64|arm64)
      echo "arm64"
      ;;
    *)
      return 1
      ;;
  esac
}

ensure_node_runtime() {
  if [[ -x "${NODE_RUNTIME_DIR}/bin/node" && -x "${NODE_RUNTIME_DIR}/bin/npm" ]]; then
    return
  fi

  local node_arch
  node_arch="$(detect_node_arch)"

  local tmp_dir
  tmp_dir="$(mktemp -d)"

  local node_tarball="${tmp_dir}/node.tar.xz"
  local extract_dir="${tmp_dir}/extract"
  mkdir -p "$extract_dir"

  log "Downloading Node.js ${NODE_RUNTIME_VERSION} (${node_arch}) for the release artifact"
  curl -fsSL -o "$node_tarball" "https://nodejs.org/dist/v${NODE_RUNTIME_VERSION}/node-v${NODE_RUNTIME_VERSION}-linux-${node_arch}.tar.xz"
  tar -xJf "$node_tarball" -C "$extract_dir"

  rm -rf "$NODE_RUNTIME_DIR"
  mkdir -p "$(dirname "$NODE_RUNTIME_DIR")"
  mv "${extract_dir}/node-v${NODE_RUNTIME_VERSION}-linux-${node_arch}" "$NODE_RUNTIME_DIR"

  rm -rf "$tmp_dir"
}

main() {
  mkdir -p "$ARTIFACT_DIR"
  ensure_node_runtime

  tar -czf "${ARTIFACT_DIR}/${ARTIFACT_NAME}" \
    package.json \
    package-lock.json \
    VERSION \
    src \
    public \
    scripts \
    .runtime

  log "Created ${ARTIFACT_DIR}/${ARTIFACT_NAME}"
}

main