#!/usr/bin/env bash
set -Eeuo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "请以 root 身份运行此脚本。" >&2
  exit 1
fi
if [[ ! -L /opt/machi-service/current ]]; then
  echo "应用尚未完成首次部署。" >&2
  exit 1
fi
source /etc/machi-service/api.env
: "${DATABASE_URL:?api.env 中缺少 DATABASE_URL}"

if [[ -z "${ADMIN_EMAIL:-}" ]]; then
  read -r -p "管理员邮箱：" ADMIN_EMAIL
fi
if [[ -z "${ADMIN_NICKNAME:-}" ]]; then
  read -r -p "管理员显示名 [運営管理者]：" ADMIN_NICKNAME
  ADMIN_NICKNAME="${ADMIN_NICKNAME:-運営管理者}"
fi
if [[ -z "${ADMIN_PASSWORD:-}" ]]; then
  read -r -s -p "管理员密码：" ADMIN_PASSWORD
  echo
  read -r -s -p "再次输入密码：" password_confirmation
  echo
  if [[ "${ADMIN_PASSWORD}" != "${password_confirmation}" ]]; then
    echo "两次输入的密码不一致。" >&2
    exit 1
  fi
fi

runuser -u machi-service -- env -i HOME=/var/lib/machi-service PATH=/usr/local/bin:/usr/bin:/bin \
  DATABASE_URL="${DATABASE_URL}" ADMIN_EMAIL="${ADMIN_EMAIL}" ADMIN_NICKNAME="${ADMIN_NICKNAME}" ADMIN_PASSWORD="${ADMIN_PASSWORD}" \
  bash -c 'cd /opt/machi-service/current && corepack pnpm --filter @local/api prisma:create-admin'
unset ADMIN_PASSWORD password_confirmation
