# Rocky Linux 9 原生部署

生产环境不需要 Docker。本项目按以下拓扑部署：

```text
Internet -> Nginx (:80/:443)
              |-- /                    顾客端静态文件
              |-- /merchant-admin/     商家管理静态文件
              |-- /platform-admin/     平台管理静态文件
              |-- /api/                NestJS (:3001，仅监听 127.0.0.1)
              `-- /uploads/            本地上传目录
                         |-- PostgreSQL 16 + PostGIS
                         `-- Redis
```

## 1. 服务器和域名

- Rocky Linux 9 x86_64 或 aarch64，建议至少 2 vCPU / 4 GB RAM。
- 将域名 A/AAAA 记录解析到服务器公网 IP。
- 使用有 sudo/root 权限的账号上传或克隆代码，例如 `/srv/machi-service-src`。
- 云平台安全组仅开放 SSH、80、443；不要对公网开放 3001、5432、6379。

以下命令均在项目根目录执行。

## 2. 安装系统依赖

```bash
sudo bash deploy/rocky/install-system-dependencies.sh
```

脚本会安装 PostgreSQL 16/PostGIS、Redis、Nginx、Node.js 24、pnpm 11，创建低权限账号 `machi-service`，启用服务并配置必要的 SELinux 网络权限。Node.js 安装包在解压前会校验官方 SHA-256 清单。

## 3. 初始化数据库

先生成并妥善保存 URL 安全的数据库密码：

```bash
DB_PASSWORD="$(openssl rand -hex 24)"
sudo DB_NAME=machi_service DB_USER=machi_service DB_PASSWORD="${DB_PASSWORD}" \
  bash deploy/rocky/setup-database.sh
```

脚本可重复运行，会创建/更新账号、数据库、PostGIS 扩展，并将本机 TCP 认证设置为 SCRAM-SHA-256。

## 4. 配置生产环境

```bash
sudo install -o root -g machi-service -m 0640 \
  deploy/rocky/api.env.example /etc/machi-service/api.env
sudo vi /etc/machi-service/api.env
```

至少修改这些值：

```dotenv
SERVER_NAME=services.example.jp
DATABASE_URL=postgresql://machi_service:上一步的密码@127.0.0.1:5432/machi_service?schema=public
JWT_SECRET=使用_openssl_rand_hex_32_生成
JWT_REFRESH_SECRET=使用另一次_openssl_rand_hex_32_生成
APP_URL=https://services.example.jp
```

生成 JWT 密钥：

```bash
openssl rand -hex 32
openssl rand -hex 32
```

环境文件禁止提交到 Git。生产校验会拒绝短密钥、示例密钥、非 PostgreSQL 数据库地址和非 HTTPS 的 `APP_URL`。

## 5. 首次发布及后续更新

```bash
sudo bash deploy/rocky/deploy.sh "$(pwd)"
```

每次运行都会：

1. 复制源码到带 UTC 时间戳的 release 目录。
2. 使用锁文件安装依赖并构建 API 和三个前端。
3. 执行 `prisma migrate deploy`。
4. 幂等写入都道府县、地区和分类参考数据；不会创建演示账号。
5. 安装 systemd、Nginx 和每日备份定时器。
6. 原子切换 `current` 链接并检查 `/api/v1/health/ready`。
7. 新版本 30 秒内未就绪时自动恢复上一个 release。

部署目录：

```text
/opt/machi-service/releases/<timestamp>   不可变发布版本
/opt/machi-service/current                当前版本软链接（含 public 静态站点）
/etc/machi-service/api.env                生产密钥（0640）
/var/lib/machi-service/uploads            上传文件
/var/backups/machi-service                PostgreSQL 自定义格式备份
```

## 6. 启用 HTTPS

首次部署后，交互式创建真实平台管理员（密码不会回显）：

```bash
sudo bash /opt/machi-service/current/deploy/rocky/create-admin.sh
```

密码至少 14 位，并需包含大写字母、小写字母和数字。脚本可用于重置指定管理员密码；执行后会撤销该账号旧的 refresh token。

随后启用 HTTPS。

确认域名已解析、80/443 已放行后执行：

```bash
sudo ADMIN_EMAIL=ops@example.jp bash deploy/rocky/enable-tls.sh
```

脚本通过 Certbot 配置 Nginx HTTPS、HTTP 重定向和 HSTS。完成后检查：

```bash
curl --fail https://services.example.jp/api/v1/health/ready
```

## 7. 运维命令

```bash
# API 状态与日志
sudo systemctl status machi-service-api
sudo journalctl -u machi-service-api -f

# Nginx 检查与日志
sudo nginx -t
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log

# 健康检查
curl --fail http://127.0.0.1:3001/api/v1/health/live
curl --fail http://127.0.0.1:3001/api/v1/health/ready

# 立即备份并查看定时器
sudo systemctl start machi-service-backup.service
sudo systemctl list-timers machi-service-backup.timer

# 恢复示例（先停 API，并替换为实际备份文件）
sudo systemctl stop machi-service-api
sudo -u postgres dropdb --if-exists machi_service_restore
sudo -u postgres createdb --owner=machi_service machi_service_restore
sudo -u postgres pg_restore --dbname=machi_service_restore \
  /var/backups/machi-service/database-YYYYMMDDTHHMMSSZ.dump
```

正式恢复前应在独立数据库完成恢复演练和数据校验。备份脚本不会自动删除旧文件，请按磁盘容量设置外部归档与保留策略。

## 8. 上线检查

- `systemctl --failed` 无失败单元。
- `/api/v1/health/live` 和 `/api/v1/health/ready` 返回 200。
- 顾客端、商家端、平台端均能通过 HTTPS 打开，刷新子路径不返回 404。
- 数据库 5432、Redis 6379、API 3001 不可从公网连接。
- Certbot 续期定时器、数据库备份定时器正常，并完成至少一次恢复演练。
- 创建真实的首个平台管理员，不使用或导入开发演示账号。
- 为 `/var/backups/machi-service` 配置异机/对象存储加密归档。

当前本地上传方案适合单机 MVP。扩展到多台 API 前，应将上传迁移到 S3/R2 Presigned URL，并把限流状态迁移到 Redis。
