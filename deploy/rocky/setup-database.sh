#!/usr/bin/env bash
set -Eeuo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "请以 root 身份运行此脚本。" >&2
  exit 1
fi

: "${DB_NAME:?请设置 DB_NAME}"
: "${DB_USER:?请设置 DB_USER}"
: "${DB_PASSWORD:?请设置 DB_PASSWORD}"

identifier_pattern='^[a-z_][a-z0-9_]*$'
if [[ ! "${DB_NAME}" =~ ${identifier_pattern} || ! "${DB_USER}" =~ ${identifier_pattern} ]]; then
  echo "DB_NAME 和 DB_USER 只能使用小写字母、数字及下划线，且不能以数字开头。" >&2
  exit 1
fi
if [[ ${#DB_PASSWORD} -lt 20 ]]; then
  echo "DB_PASSWORD 至少需要 20 个字符。" >&2
  exit 1
fi
if [[ ! "${DB_PASSWORD}" =~ ^[A-Za-z0-9_-]+$ ]]; then
  echo "DB_PASSWORD 只能使用 URL 安全的字母、数字、下划线和连字符。" >&2
  exit 1
fi

mysql_args=(--protocol=socket --user=root)
if [[ -n "${MYSQL_ROOT_PASSWORD:-}" ]]; then
  export MYSQL_PWD="${MYSQL_ROOT_PASSWORD}"
fi
mysql "${mysql_args[@]}" <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL
unset MYSQL_PWD
echo "数据库 ${DB_NAME} 及账号 ${DB_USER} 已就绪。"
