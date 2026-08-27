# Database

Prisma schema は `apps/api/prisma/schema.prisma` にあります。

主要な関係:

```text
User ── MerchantMember ── Merchant ── MerchantAddress
                           ├── MerchantBusinessHour
                           ├── Service / Product / MediaFile
                           ├── MerchantVerification
                           └── Conversation ── Message
User ── Favorite
Admin(User) ── AuditLog
Prefecture ── Municipality
Category ── Merchant / Service / Product
```

金額は整数 JPY、郵便番号と電話番号は記号なしで保存します。位置情報は MVP では Decimal 緯度経度です。大規模化時は PostGIS geography column と GiST index を migration で追加します。

削除は関連コンテンツに Cascade を設定しています。運用中のユーザー/店舗は物理削除ではなく status 変更を優先します。
