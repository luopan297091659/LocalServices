#!/usr/bin/env bash
set -Eeuo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "请以 root 身份运行此脚本。" >&2
  exit 1
fi

source /etc/os-release
major_version="${VERSION_ID%%.*}"
case "${ID:-}" in
  rocky|rhel|almalinux) ;;
  *) echo "仅支持 Rocky Linux/RHEL/AlmaLinux，当前系统为 ${PRETTY_NAME:-unknown}。" >&2; exit 1 ;;
esac
if [[ "${major_version}" != "9" ]]; then
  echo "当前脚本针对 Rocky Linux 9 系列，检测到 ${PRETTY_NAME:-unknown}。" >&2
  exit 1
fi

dnf -y install dnf-plugins-core curl git nginx redis rsync tar xz firewalld policycoreutils-python-utils
dnf -y module reset postgresql
dnf -y module enable postgresql:16
dnf -y install postgresql-server postgresql-contrib postgis

if [[ ! -s /var/lib/pgsql/data/PG_VERSION ]]; then
  postgresql-setup --initdb
fi

node_arch=""
case "$(uname -m)" in
  x86_64) node_arch="x64" ;;
  aarch64) node_arch="arm64" ;;
  *) echo "不支持的 CPU 架构：$(uname -m)" >&2; exit 1 ;;
esac

node_index_url="https://nodejs.org/dist/latest-v24.x"
temp_dir="$(mktemp -d)"
trap 'rm -rf -- "$temp_dir"' EXIT
curl --fail --silent --show-error --location "${node_index_url}/SHASUMS256.txt" --output "${temp_dir}/SHASUMS256.txt"
node_archive="$(awk -v arch="linux-${node_arch}.tar.xz" '$2 ~ arch "$" { print $2; exit }' "${temp_dir}/SHASUMS256.txt")"
if [[ -z "${node_archive}" ]]; then
  echo "无法在 Node.js 校验清单中找到 ${node_arch} 安装包。" >&2
  exit 1
fi
curl --fail --silent --show-error --location "${node_index_url}/${node_archive}" --output "${temp_dir}/${node_archive}"
(cd "${temp_dir}" && grep " ${node_archive}$" SHASUMS256.txt | sha256sum --check --status)

install -d -m 0755 /usr/local/lib/nodejs
node_dir="${node_archive%.tar.xz}"
rm -rf -- "/usr/local/lib/nodejs/${node_dir}"
tar -xJf "${temp_dir}/${node_archive}" -C /usr/local/lib/nodejs
for binary in node npm npx corepack; do
  ln -sfn "/usr/local/lib/nodejs/${node_dir}/bin/${binary}" "/usr/local/bin/${binary}"
done
corepack enable
corepack prepare pnpm@11.19.0 --activate

if ! getent group machi-service >/dev/null; then
  groupadd --system machi-service
fi
if ! id machi-service >/dev/null 2>&1; then
  useradd --system --gid machi-service --home-dir /var/lib/machi-service --shell /usr/sbin/nologin machi-service
fi
usermod -a -G machi-service nginx

install -d -o machi-service -g machi-service -m 0750 /opt/machi-service/releases
install -d -o machi-service -g machi-service -m 0750 /var/lib/machi-service
install -d -o machi-service -g machi-service -m 0750 /var/lib/machi-service/uploads
install -d -o root -g machi-service -m 0750 /etc/machi-service

systemctl enable --now postgresql redis nginx
nginx -t
systemctl restart nginx
if systemctl is-active --quiet firewalld; then
  firewall-cmd --permanent --add-service=http
  firewall-cmd --permanent --add-service=https
  firewall-cmd --reload
fi
setsebool -P httpd_can_network_connect 1

echo "系统依赖安装完成：$(node --version), pnpm $(pnpm --version), PostgreSQL 16, Redis, Nginx。"
