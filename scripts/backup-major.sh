#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WINDOWS_D_DRIVE="/mnt/d"
DESTINATION="${WINDOWS_D_DRIVE}/-- Next Projects BackUps"
ARCHIVE_NAME="subscription-memo-major-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
ARCHIVE_PATH="${DESTINATION}/${ARCHIVE_NAME}"

INCLUDE_PATHS=(
  "src"
  "prisma"
  "public"
  ".git"
  ".cursor/rules"
  ".nvmrc"
  ".gitignore"
  ".env"
  ".env.local"
  ".env.example"
  "README.md"
  "package.json"
  "package-lock.json"
  "next.config.ts"
  "next-env.d.ts"
  "prisma.config.ts"
  "tsconfig.json"
  "eslint.config.mjs"
  "postcss.config.mjs"
  "components.json"
)

cd "${PROJECT_ROOT}"

if [[ ! -d "${WINDOWS_D_DRIVE}" ]]; then
  echo "Windows D drive is not available at ${WINDOWS_D_DRIVE}." >&2
  exit 1
fi

mkdir -p "${DESTINATION}"

existing_paths=()
for path in "${INCLUDE_PATHS[@]}"; do
  if [[ -e "${path}" ]]; then
    existing_paths+=("${path}")
  fi
done

if [[ "${#existing_paths[@]}" -eq 0 ]]; then
  echo "No backup targets found." >&2
  exit 1
fi

tar -czf "${ARCHIVE_PATH}" \
  --exclude="node_modules" \
  --exclude=".next" \
  --exclude="*.log" \
  --exclude="*.tar.gz" \
  "${existing_paths[@]}"

unexpected_entries=""
while IFS= read -r entry; do
  case "${entry}" in
    *node_modules/*|*.next/*)
      unexpected_entries+="${entry}"$'\n'
      ;;
  esac
done < <(tar -tzf "${ARCHIVE_PATH}")

if [[ -n "${unexpected_entries}" ]]; then
  echo "Unexpected entries found in archive:" >&2
  printf "%s" "${unexpected_entries}" >&2
  exit 1
fi

echo "Backup created: ${ARCHIVE_PATH}"
echo "Included ${#existing_paths[@]} top-level targets."
