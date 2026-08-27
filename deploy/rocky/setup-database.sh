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

runuser -u postgres -- psql --set ON_ERROR_STOP=1 --command "ALTER SYSTEM SET password_encryption = 'scram-sha-256';"
sed -ri '/^host[[:space:]]+all[[:space:]]+all[[:space:]]+(127\.0\.0\.1\/32|::1\/128)[[:space:]]+/ s/[[:space:]]+(ident|md5|password)[[:space:]]*$/ scram-sha-256/' /var/lib/pgsql/data/pg_hba.conf
systemctl reload postgresql

runuser -u postgres -- psql --set ON_ERROR_STOP=1 --set role="${DB_USER}" --set password="${DB_PASSWORD}" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN', :'role')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'role') \gexec
SELECT format('ALTER ROLE %I PASSWORD %L', :'role', :'password') \gexec
SQL

runuser -u postgres -- psql --set ON_ERROR_STOP=1 --set db="${DB_NAME}" --set role="${DB_USER}" <<'SQL'
SELECT format('CREATE DATABASE %I OWNER %I', :'db', :'role')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'db') \gexec
SQL

runuser -u postgres -- psql --dbname "${DB_NAME}" --set ON_ERROR_STOP=1 --command 'CREATE EXTENSION IF NOT EXISTS postgis;'
echo "数据库 ${DB_NAME} 及账号 ${DB_USER} 已就绪。"
