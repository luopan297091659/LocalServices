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
mapfile -t database_connection < <(node -e '
const url = new URL(process.env.DATABASE_URL);
if (url.protocol !== "mysql:" || !url.hostname || !url.username || !url.password || url.pathname === "/") process.exit(1);
process.stdout.write([url.hostname, url.port || "3306", decodeURIComponent(url.username), decodeURIComponent(url.password), decodeURIComponent(url.pathname.slice(1))].join("\n"));
')
MYSQL_PWD="${database_connection[3]}" mariadb-dump \
  --protocol=TCP --host="${database_connection[0]}" --port="${database_connection[1]}" --user="${database_connection[2]}" \
  --single-transaction --routines --events "${database_connection[4]}" | gzip -9 > "${backup_dir}/database-${timestamp}.sql.gz"
echo "数据库备份完成：${backup_dir}/database-${timestamp}.sql.gz"
