#!/usr/bin/env bash
# Download Chromium shared libraries into .playwright-sysroot (no sudo).
# Useful on minimal WSL images where `playwright install-deps` needs root.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SYSROOT="${ROOT_DIR}/.playwright-sysroot"
DEB_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "${DEB_DIR}"
}
trap cleanup EXIT

rm -rf "${SYSROOT}"
mkdir -p "${SYSROOT}" "${DEB_DIR}"
cd "${DEB_DIR}"

apt-get download libnspr4 libnss3 libasound2t64
for deb in ./*.deb; do
  dpkg-deb -x "${deb}" "${SYSROOT}"
done

echo "Installed libs under ${SYSROOT}"
echo "Run E2E with: npm run test:e2e"
