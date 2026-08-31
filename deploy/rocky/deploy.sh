#!/usr/bin/env bash
set -Eeuo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "请以 root 身份运行此脚本。" >&2
  exit 1
fi

source_dir="${1:-$(pwd)}"
source_dir="$(realpath "${source_dir}")"
if [[ ! -f "${source_dir}/package.json" || ! -f "${source_dir}/deploy/rocky/machi-service-api.service" ]]; then
  echo "${source_dir} 不是有效的项目源码目录。" >&2
  exit 1
fi
if [[ ! -s /etc/machi-service/api.env ]]; then
  install -o root -g machi-service -m 0640 "${source_dir}/deploy/rocky/api.env.example" /etc/machi-service/api.env
  echo "已创建 /etc/machi-service/api.env。请先填入真实域名、数据库密码和 JWT 密钥后重新部署。" >&2
  exit 2
fi

public_path="$(sed -n 's/^PUBLIC_PATH=//p' /etc/machi-service/api.env | tail -n 1 | tr -d '\r')"
if [[ ! "${public_path}" =~ ^/[a-z0-9][a-z0-9/_-]*$ || "${public_path}" == */ || "${public_path}" == *//* ]]; then
  echo "PUBLIC_PATH 必须是无结尾斜杠的安全 URL 路径，例如 /local-services。" >&2
  exit 1
fi
process_manager="$(sed -n 's/^PROCESS_MANAGER=//p' /etc/machi-service/api.env | tail -n 1 | tr -d '\r')"
process_manager="${process_manager:-systemd}"
if [[ "${process_manager}" != "systemd" && "${process_manager}" != "pm2" ]]; then
  echo "PROCESS_MANAGER 仅支持 systemd 或 pm2。" >&2
  exit 1
fi
if [[ "${process_manager}" == "pm2" ]] && ! command -v pm2 >/dev/null 2>&1; then
  echo "PROCESS_MANAGER=pm2 需要先安装 PM2：sudo npm install --global pm2" >&2
  exit 1
fi

release_id="$(date -u +%Y%m%dT%H%M%SZ)"
app_root="/opt/machi-service"
release_dir="${app_root}/releases/${release_id}"
previous_target="$(readlink -f "${app_root}/current" 2>/dev/null || true)"

install -d -o machi-service -g machi-service -m 0750 "${release_dir}"
rsync -a --delete \
  --exclude=.git --exclude=node_modules --exclude=dist --exclude=.env --exclude=uploads \
  "${source_dir}/" "${release_dir}/"
chown -R machi-service:machi-service "${release_dir}"

clean_env=(env -i HOME=/var/lib/machi-service PATH=/usr/local/bin:/usr/bin:/bin)
runuser -u machi-service -- "${clean_env[@]}" bash -c "cd '${release_dir}' && corepack pnpm install --frozen-lockfile"
runuser -u machi-service -- "${clean_env[@]}" DATABASE_URL=postgresql://unused:unused@127.0.0.1:5432/unused \
  VITE_PUBLIC_PATH="${public_path}" VITE_API_URL="${public_path}/api/v1" \
  bash -c "cd '${release_dir}' && corepack pnpm db:generate && corepack pnpm build"

public_dir="${release_dir}/public-root${public_path}"
install -d -o machi-service -g machi-service -m 0750 \
  "${public_dir}" "${public_dir}/merchant-admin" "${public_dir}/platform-admin"
rsync -a "${release_dir}/apps/web-client/dist/" "${public_dir}/"
rsync -a "${release_dir}/apps/merchant-admin/dist/" "${public_dir}/merchant-admin/"
rsync -a "${release_dir}/apps/platform-admin/dist/" "${public_dir}/platform-admin/"
chown -R machi-service:machi-service "${release_dir}/public-root"

set -a
source /etc/machi-service/api.env
set +a
: "${DATABASE_URL:?/etc/machi-service/api.env 中缺少 DATABASE_URL}"
: "${SERVER_NAME:?/etc/machi-service/api.env 中缺少 SERVER_NAME}"
if [[ ! "${SERVER_NAME}" =~ ^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$ ]]; then
  echo "SERVER_NAME 不是有效域名：${SERVER_NAME}" >&2
  exit 1
fi
runuser -u machi-service -- "${clean_env[@]}" DATABASE_URL="${DATABASE_URL}" \
  bash -c "cd '${release_dir}' && corepack pnpm --filter @local/api prisma:deploy"
runuser -u machi-service -- "${clean_env[@]}" DATABASE_URL="${DATABASE_URL}" SEED_DEMO_DATA=false \
  bash -c "cd '${release_dir}' && corepack pnpm --filter @local/api prisma:seed"

install -o root -g root -m 0644 "${release_dir}/deploy/rocky/machi-service-api.service" /etc/systemd/system/machi-service-api.service
install -o root -g root -m 0644 "${release_dir}/deploy/rocky/machi-service-api.ecosystem.config.cjs" /etc/machi-service/machi-service-api.ecosystem.config.cjs
install -o root -g root -m 0644 "${release_dir}/deploy/rocky/machi-service-backup.service" /etc/systemd/system/machi-service-backup.service
install -o root -g root -m 0644 "${release_dir}/deploy/rocky/machi-service-backup.timer" /etc/systemd/system/machi-service-backup.timer
install -d -o root -g root -m 0755 /etc/nginx/snippets
sed "s|__PUBLIC_PATH__|${public_path}|g" "${release_dir}/deploy/rocky/machi-service.locations.conf" > /etc/nginx/snippets/machi-service.locations.conf
chmod 0644 /etc/nginx/snippets/machi-service.locations.conf
if [[ -f /etc/nginx/conf.d/machi-service.conf ]]; then
  mv -f /etc/nginx/conf.d/machi-service.conf /etc/nginx/conf.d/machi-service.conf.disabled
fi
nginx -t

nginx_integrated=false
if nginx -T 2>&1 | grep -Fq "location = ${public_path} {"; then
  nginx_integrated=true
fi

semanage fcontext -a -t httpd_sys_content_t "${app_root}/releases(/.*)?" 2>/dev/null || \
  semanage fcontext -m -t httpd_sys_content_t "${app_root}/releases(/.*)?"
semanage fcontext -a -t httpd_sys_content_t "/var/lib/machi-service/uploads(/.*)?" 2>/dev/null || \
  semanage fcontext -m -t httpd_sys_content_t "/var/lib/machi-service/uploads(/.*)?"
restorecon -RF "${app_root}/releases" /var/lib/machi-service/uploads

next_link="${app_root}/current-${release_id}"
ln -s "${release_dir}" "${next_link}"
mv -Tf "${next_link}" "${app_root}/current"

systemctl daemon-reload
systemctl enable machi-service-backup.timer nginx
systemctl restart machi-service-backup.timer
systemctl reload nginx

pm2_command=(runuser -u machi-service -- env HOME=/var/lib/machi-service PATH=/usr/local/bin:/usr/bin:/bin)
if [[ "${process_manager}" == "pm2" ]]; then
  systemctl disable --now machi-service-api 2>/dev/null || true
else
  "${pm2_command[@]}" pm2 delete machi-service-api >/dev/null 2>&1 || true
  systemctl enable machi-service-api
fi

restart_api() {
  if [[ "${process_manager}" == "pm2" ]]; then
    "${pm2_command[@]}" pm2 startOrReload /etc/machi-service/machi-service-api.ecosystem.config.cjs --only machi-service-api --update-env
    "${pm2_command[@]}" pm2 save
  else
    systemctl restart machi-service-api
  fi
}

healthy=false
if restart_api; then
  for _ in {1..30}; do
    if curl --fail --silent --show-error http://127.0.0.1:3001/api/v1/health/ready >/dev/null; then
      healthy=true
      break
    fi
    sleep 1
  done
fi

if [[ "${healthy}" != true ]]; then
  journalctl -u machi-service-api --no-pager -n 80 >&2 || true
  if [[ -n "${previous_target}" && -d "${previous_target}" ]]; then
    rollback_link="${app_root}/rollback-${release_id}"
    ln -s "${previous_target}" "${rollback_link}"
    mv -Tf "${rollback_link}" "${app_root}/current"
    restart_api
    systemctl reload nginx
    echo "健康检查失败，已自动回滚到 ${previous_target}。" >&2
  else
    echo "健康检查失败，且不存在可回滚版本。" >&2
  fi
  exit 1
fi

echo "发布成功：${release_dir}"
echo "健康检查：http://127.0.0.1:3001/api/v1/health/ready"
echo "API 进程管理：${process_manager}"
echo "客户入口：https://${SERVER_NAME}${public_path}/"
if [[ "${nginx_integrated}" != true ]]; then
  echo "注意：请在 kotabi.top 现有的 server 块中加入以下配置后重载 Nginx：" >&2
  echo "include /etc/nginx/snippets/machi-service.locations.conf;" >&2
fi
