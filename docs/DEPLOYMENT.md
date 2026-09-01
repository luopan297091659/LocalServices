# Rocky Linux 9 原生部署

生产环境不需要 Docker。本项目按以下拓扑部署：

```text
Internet -> kotabi.top 的现有 Nginx (:80/:443)
              |-- /local-services/                         顾客端静态文件
              |-- /local-services/merchant-admin/          商家管理静态文件
              |-- /local-services/platform-admin/          平台管理静态文件
              |-- /local-services/api/                     NestJS (:3001，仅监听 127.0.0.1)
              `-- /local-services/uploads/                 本地上传目录
                         |-- PostgreSQL 16 + PostGIS
                         `-- Redis
```

## 1. 服务器和域名

- Rocky Linux 9 x86_64 或 aarch64，建议至少 2 vCPU / 4 GB RAM。
- 当前域名为 `kotabi.top`，使用 `/local-services` 与同域名下其他系统隔离。
- 使用有 sudo/root 权限的账号上传或克隆代码，例如 `/srv/machi-service-src`。
- 云平台安全组仅开放 SSH、80、443；不要对公网开放 3001、5432、6379。

以下命令均在项目根目录执行。

## 2. 安装系统依赖

```bash
sudo bash deploy/rocky/install-system-dependencies.sh
```

脚本会安装 PostgreSQL 16/PostGIS、Redis、Nginx、Node.js 18、npm，创建低权限账号 `machi-service`，启用服务并配置必要的 SELinux 网络权限。Node.js 安装包在解压前会校验官方 SHA-256 清单。

### 使用 PM2 管理 API（可选）

默认使用 systemd。若服务器统一使用 PM2 管理 Node.js 服务，请在首次发布前安装 PM2，并在下面的环境文件中设为 `PROCESS_MANAGER=pm2`：

```bash
sudo npm install --global pm2
sudo env PATH="$PATH:/usr/local/bin" pm2 startup systemd -u machi-service --hp /var/lib/machi-service
```

前端是 Nginx 直接提供的静态文件，不应使用 PM2 启动；PM2 仅负责监听 `127.0.0.1:3001` 的 NestJS API。部署脚本会在每次发布后执行 `pm2 startOrReload` 与 `pm2 save`。`pm2 startup` 只需首次执行一次。

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
PROCESS_MANAGER=pm2
SERVER_NAME=kotabi.top
PUBLIC_PATH=/local-services
DATABASE_URL=postgresql://machi_service:上一步的密码@127.0.0.1:5432/machi_service?schema=public
JWT_SECRET=使用_openssl_rand_hex_32_生成
JWT_REFRESH_SECRET=使用另一次_openssl_rand_hex_32_生成
APP_URL=https://kotabi.top
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
5. 安装 Nginx、每日备份定时器，以及所选的 API 进程管理配置（systemd 或 PM2）。
6. 原子切换 `current` 链接并检查 `/api/v1/health/ready`。
7. 新版本 30 秒内未就绪时自动恢复上一个 release。

发布脚本会生成：

```text
/etc/nginx/snippets/machi-service.locations.conf
```

由于 `kotabi.top` 已有其他系统，脚本不会覆盖现有 Nginx `server`。首次部署后，在 `kotabi.top` 当前 HTTPS `server {}` 内加入：

```nginx
include /etc/nginx/snippets/machi-service.locations.conf;
```

例如：

```nginx
server {
    listen 443 ssl http2;
    server_name kotabi.top;

    # 现有证书和其他系统 location 保持不变
    include /etc/nginx/snippets/machi-service.locations.conf;
}
```

然后执行：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

片段会把 `https://kotabi.top/local-services/api/v1/...` 转发为本机 `http://127.0.0.1:3001/api/v1/...`。

### 手工编译命令

部署脚本已经执行这些命令；需要手工构建时，在项目根目录执行。`VITE_PUBLIC_PATH` 必须与 Nginx 挂载路径完全一致，且不带结尾斜杠：

```bash
export VITE_PUBLIC_PATH=/local-services
export VITE_API_URL=/local-services/api/v1

npm ci --include=dev
npm run db:generate
npm run build:frontend  # 顾客端、商家管理端、平台管理端
npm run build:backend   # NestJS API
```

也可用 `npm run build` 一次编译所有工作区。前端产物分别位于 `apps/web-client/dist`、`apps/merchant-admin/dist`、`apps/platform-admin/dist`；发布脚本会将它们复制到 Nginx 读取的 `public-root${VITE_PUBLIC_PATH}` 目录。

### PM2 手工启动与日常命令

使用 `PROCESS_MANAGER=pm2` 并完成首次发布后，部署脚本会自动启动 API。需要手工启动或重载时，使用低权限账号运行以下命令：

```bash
sudo -u machi-service env HOME=/var/lib/machi-service PATH=/usr/local/bin:/usr/bin:/bin \
  pm2 startOrReload /etc/machi-service/machi-service-api.ecosystem.config.cjs \
  --only machi-service-api --update-env
sudo -u machi-service env HOME=/var/lib/machi-service PATH=/usr/local/bin:/usr/bin:/bin \
  pm2 save

sudo -u machi-service env HOME=/var/lib/machi-service PATH=/usr/local/bin:/usr/bin:/bin pm2 status
sudo -u machi-service env HOME=/var/lib/machi-service PATH=/usr/local/bin:/usr/bin:/bin pm2 logs machi-service-api
```

请勿同时启用 `machi-service-api.service` 和 PM2，否则两个 API 进程会争抢 3001 端口。将 `PROCESS_MANAGER` 改回 `systemd` 后，重新运行部署脚本即可自动停掉 PM2 进程并启用 systemd。

部署目录：

```text
/opt/machi-service/releases/<timestamp>   不可变发布版本
/opt/machi-service/current                当前版本软链接（含 public-root/local-services 静态站点）
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

如果 `kotabi.top` 已配置 HTTPS，无需再次运行 Certbot，只需完成上面的 Nginx include 和 reload。

尚未配置 HTTPS 时才执行：

确认域名已解析、80/443 已放行后执行：

```bash
sudo ADMIN_EMAIL=ops@example.jp bash deploy/rocky/enable-tls.sh
```

脚本通过 Certbot 配置 Nginx HTTPS、HTTP 重定向和 HSTS。完成后检查：

```bash
curl --fail https://kotabi.top/local-services/api/v1/health/ready
```

## 7. 运维命令

```bash
# API 状态与日志（PROCESS_MANAGER=systemd）
sudo systemctl status machi-service-api
sudo journalctl -u machi-service-api -f

# API 状态与日志（PROCESS_MANAGER=pm2）
sudo -u machi-service env HOME=/var/lib/machi-service PATH=/usr/local/bin:/usr/bin:/bin pm2 status
sudo -u machi-service env HOME=/var/lib/machi-service PATH=/usr/local/bin:/usr/bin:/bin pm2 logs machi-service-api

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
- `https://kotabi.top/local-services/` 可以打开。
- 顾客端、商家端、平台端均能通过 HTTPS 打开，刷新子路径不返回 404。
- 数据库 5432、Redis 6379、API 3001 不可从公网连接。
- Certbot 续期定时器、数据库备份定时器正常，并完成至少一次恢复演练。
- 创建真实的首个平台管理员，不使用或导入开发演示账号。
- 为 `/var/backups/machi-service` 配置异机/对象存储加密归档。

当前本地上传方案适合单机 MVP。扩展到多台 API 前，应将上传迁移到 S3/R2 Presigned URL，并把限流状态迁移到 Redis。
