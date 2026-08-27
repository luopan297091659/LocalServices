#!/usr/bin/env bash
set -Eeuo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "请以 root 身份运行此脚本。" >&2
  exit 1
fi
source /etc/machi-service/api.env
: "${DATABASE_URL:?api.env 中缺少 DATABASE_URL}"

backup_dir="/var/backups/machi-service"
install -d -o root -g root -m 0700 "${backup_dir}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
umask 0077
postgres_url="${DATABASE_URL%%\?*}"
pg_dump --format=custom --compress=9 --file="${backup_dir}/database-${timestamp}.dump" "${postgres_url}"
echo "数据库备份完成：${backup_dir}/database-${timestamp}.dump"
