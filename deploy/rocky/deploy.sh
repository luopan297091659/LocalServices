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
  bash -c "cd '${release_dir}' && corepack pnpm db:generate && corepack pnpm build"

install -d -o machi-service -g machi-service -m 0750 \
  "${release_dir}/public" "${release_dir}/public/merchant-admin" "${release_dir}/public/platform-admin"
rsync -a "${release_dir}/apps/web-client/dist/" "${release_dir}/public/"
rsync -a "${release_dir}/apps/merchant-admin/dist/" "${release_dir}/public/merchant-admin/"
rsync -a "${release_dir}/apps/platform-admin/dist/" "${release_dir}/public/platform-admin/"
chown -R machi-service:machi-service "${release_dir}/public"

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
install -o root -g root -m 0644 "${release_dir}/deploy/rocky/machi-service-backup.service" /etc/systemd/system/machi-service-backup.service
install -o root -g root -m 0644 "${release_dir}/deploy/rocky/machi-service-backup.timer" /etc/systemd/system/machi-service-backup.timer
sed "s/server_name _;/server_name ${SERVER_NAME};/" "${release_dir}/deploy/rocky/machi-service.nginx.conf" > /etc/nginx/conf.d/machi-service.conf
chmod 0644 /etc/nginx/conf.d/machi-service.conf
nginx -t

semanage fcontext -a -t httpd_sys_content_t "${app_root}/releases(/.*)?" 2>/dev/null || \
  semanage fcontext -m -t httpd_sys_content_t "${app_root}/releases(/.*)?"
semanage fcontext -a -t httpd_sys_content_t "/var/lib/machi-service/uploads(/.*)?" 2>/dev/null || \
  semanage fcontext -m -t httpd_sys_content_t "/var/lib/machi-service/uploads(/.*)?"
restorecon -RF "${app_root}/releases" /var/lib/machi-service/uploads

next_link="${app_root}/current-${release_id}"
ln -s "${release_dir}" "${next_link}"
mv -Tf "${next_link}" "${app_root}/current"

systemctl daemon-reload
systemctl enable machi-service-api machi-service-backup.timer nginx
systemctl restart machi-service-backup.timer
systemctl reload nginx

healthy=false
if systemctl restart machi-service-api; then
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
    systemctl restart machi-service-api
    systemctl reload nginx
    echo "健康检查失败，已自动回滚到 ${previous_target}。" >&2
  else
    echo "健康检查失败，且不存在可回滚版本。" >&2
  fi
  exit 1
fi

echo "发布成功：${release_dir}"
echo "健康检查：http://127.0.0.1:3001/api/v1/health/ready"
