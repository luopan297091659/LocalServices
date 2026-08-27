# Business rules

- 公開検索に出るのは `Merchant.status = ACTIVE` の店舗だけです。
- 公開ページに出る Service/Product は `PUBLISHED` だけです。
- 店舗の提出で状態は `PENDING`、管理者承認で `ACTIVE` になります。
- 店舗スタッフは必ず MerchantMember を通じて自店舗だけを操作します。
- Customer の正確な GPS は検索リクエストにのみ使い、User へ保存しません。
- 料金は JPY 整数。`START_FROM` は `3,500円〜`、`NEGOTIABLE` は `要相談` と表示します。
- 問い合わせの当事者（Customer と該当 MerchantMember）だけが Message を閲覧できます。
- V1 は決済、注文、予約、評価投稿を扱いません。
