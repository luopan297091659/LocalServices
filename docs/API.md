# API

Base URL: ローカルは `http://localhost:3001/api/v1`、Rocky 本番は `https://kotabi.top/local-services/api/v1`。Nginx が公開 URL の `/local-services` を除去して本机 `127.0.0.1:3001/api/v1` に転送します。成功レスポンスは `{ success, code, message, data }`、失敗レスポンスは同じ envelope で `success: false` です。保護 API は `Authorization: Bearer <accessToken>` を使用します。公開店舗/カテゴリ/health API は認証不要です。

## Health

- `GET /health`, `GET /health/live`: process liveness
- `GET /health/ready`: PostgreSQL readiness（デプロイと監視に使用）

## Authentication

- `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`
- `GET /auth/me`, `PATCH /auth/me`

## Public

- `GET /categories`
- `GET /merchants`, `/merchants/search`
- `GET /merchants/:id`
- `GET /merchants/:id/services`, `/products`, `/media`, `/business-hours`

検索 parameter: `keyword`, `prefectureCode`, `municipalityCode`, `categoryId`, `lat`, `lng`, `radius`, `openNow`, `sort`, `page`, `pageSize`。

## Customer

- `GET/POST /favorites`, `DELETE /favorites/:type/:targetId`
- `POST/GET /conversations`
- `GET /conversations/:id/messages`
- `POST /conversations/:id/messages`
- `PATCH /conversations/:id/read`

## Merchant

- `POST /merchant/register`, `GET/PUT /merchant/profile`, `POST /merchant/submit`
- `GET /merchant/dashboard`, `PUT /merchant/business-hours`
- CRUD `/merchant/services`, `/merchant/products`
- `GET/POST /merchant/media`, `DELETE /merchant/media/:id`
- `POST /upload` (`multipart/form-data`, field `file`; JPEG/PNG/WEBP ≤10MB, MP4 ≤100MB)

すべての店舗 API は `MerchantMember` を確認し、他店舗の ID による横断アクセスを拒否します。

## Admin

- `GET /admin/dashboard`, `/users`, `/merchants`, `/merchants/:id`
- `POST /admin/merchants/:id/approve`, `/reject`
- `PATCH /admin/merchants/:id/status`, `/users/:id/status`
- CRUD `/admin/categories`, `/admin/banners`

`ADMIN` / `SUPER_ADMIN` のみアクセス可能。店舗審査と状態変更は `AuditLog` に保存します。

OpenAPI UI: `http://localhost:3001/api/docs`。生产环境默认通过 `SWAGGER_ENABLED=false` 关闭。
