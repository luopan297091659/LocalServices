#!/usr/bin/env bash
set -Eeuo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "请以 root 身份运行此脚本。" >&2
  exit 1
fi
source /etc/machi-service/api.env
: "${SERVER_NAME:?api.env 中缺少 SERVER_NAME}"
: "${ADMIN_EMAIL:?请设置 ADMIN_EMAIL}"
if [[ ! "${ADMIN_EMAIL}" =~ ^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$ ]]; then
  echo "ADMIN_EMAIL 格式无效。" >&2
  exit 1
fi

dnf -y install epel-release
dnf -y install certbot python3-certbot-nginx
certbot --nginx --non-interactive --agree-tos --redirect --hsts \
  --email "${ADMIN_EMAIL}" --domains "${SERVER_NAME}"
systemctl enable --now certbot-renew.timer 2>/dev/null || true
echo "HTTPS 已启用：https://${SERVER_NAME}"
