import { PrismaClient, ContentStatus, MerchantStatus, PriceType, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const prefectures = [
  ['01','北海道','Hokkaido'],['02','青森県','Aomori'],['03','岩手県','Iwate'],['04','宮城県','Miyagi'],['05','秋田県','Akita'],['06','山形県','Yamagata'],['07','福島県','Fukushima'],
  ['08','茨城県','Ibaraki'],['09','栃木県','Tochigi'],['10','群馬県','Gunma'],['11','埼玉県','Saitama'],['12','千葉県','Chiba'],['13','東京都','Tokyo'],['14','神奈川県','Kanagawa'],
  ['15','新潟県','Niigata'],['16','富山県','Toyama'],['17','石川県','Ishikawa'],['18','福井県','Fukui'],['19','山梨県','Yamanashi'],['20','長野県','Nagano'],
  ['21','岐阜県','Gifu'],['22','静岡県','Shizuoka'],['23','愛知県','Aichi'],['24','三重県','Mie'],['25','滋賀県','Shiga'],['26','京都府','Kyoto'],['27','大阪府','Osaka'],
  ['28','兵庫県','Hyogo'],['29','奈良県','Nara'],['30','和歌山県','Wakayama'],['31','鳥取県','Tottori'],['32','島根県','Shimane'],['33','岡山県','Okayama'],['34','広島県','Hiroshima'],
  ['35','山口県','Yamaguchi'],['36','徳島県','Tokushima'],['37','香川県','Kagawa'],['38','愛媛県','Ehime'],['39','高知県','Kochi'],['40','福岡県','Fukuoka'],['41','佐賀県','Saga'],
  ['42','長崎県','Nagasaki'],['43','熊本県','Kumamoto'],['44','大分県','Oita'],['45','宮崎県','Miyazaki'],['46','鹿児島県','Kagoshima'],['47','沖縄県','Okinawa'],
] as const;

const categories = [
  ['cleaning','ハウスクリーニング','🧹'],['minpaku','民泊清掃','🛏️'],['moving','引越し','📦'],['disposal','不用品回収','♻️'],['housekeeping','家事代行','🏠'],['aircon','エアコン清掃','❄️'],
  ['plumbing','水道修理','🔧'],['electric','電気工事','💡'],['key','鍵交換','🔑'],['renovation','リフォーム','🛠️'],['realestate','不動産','🏢'],['beauty','美容室','✂️'],
  ['nail','ネイル','💅'],['esthetic','エステ','✨'],['massage','マッサージ','💆'],['car','自動車修理・車検','🚗'],['pet','ペット','🐾'],['photo','写真撮影','📷'],
  ['translation','翻訳・通訳','🌐'],['education','教育・塾','📚'],['travel','旅行','🧳'],['food','飲食','🍽️'],['other','その他','⋯'],
] as const;

async function main(): Promise<void> {
  for (const [index, [code, nameJa, nameEn]] of prefectures.entries()) {
    await prisma.prefecture.upsert({ where: { code }, update: { nameJa, nameEn, sort: index + 1 }, create: { id: index + 1, code, nameJa, nameEn, sort: index + 1 } });
  }
  const osakaCities = [
    ['27106','大阪市西区','おおさかしにしく'],['27128','大阪市中央区','おおさかしちゅうおうく'],['27111','大阪市浪速区','おおさかしなにわく'],
    ['27127','大阪市北区','おおさかしきたく'],['27102','大阪市都島区','おおさかしみやこじまく'],['27140','堺市','さかいし'],['27205','吹田市','すいたし'],['27203','豊中市','とよなかし'],
  ] as const;
  for (const [code, nameJa, nameKana] of osakaCities) await prisma.municipality.upsert({ where: { code }, update: { nameJa, nameKana }, create: { id: code, code, nameJa, nameKana, prefectureId: 27 } });
  for (const [index, [id, nameJa, icon]] of categories.entries()) await prisma.category.upsert({ where: { id }, update: { nameJa, icon, sort: index }, create: { id, nameJa, icon, sort: index } });

  if (process.env.SEED_DEMO_DATA === 'false') {
    console.info('Reference seed complete. Demo accounts and merchant data were skipped.');
    return;
  }

  const passwordHash = await argon2.hash('Demo1234!');
  const admin = await prisma.user.upsert({ where: { email: 'admin@machiservice.jp' }, update: { passwordHash }, create: { email: 'admin@machiservice.jp', nickname: '運営管理者', passwordHash, role: UserRole.SUPER_ADMIN } });
  const merchantUser = await prisma.user.upsert({ where: { email: 'merchant@machiservice.jp' }, update: { passwordHash }, create: { email: 'merchant@machiservice.jp', nickname: '大阪清掃 太郎', passwordHash, role: UserRole.MERCHANT_ADMIN } });
  await prisma.user.upsert({ where: { email: 'customer@machiservice.jp' }, update: { passwordHash }, create: { email: 'customer@machiservice.jp', nickname: '山田 花子', passwordHash, role: UserRole.CUSTOMER } });

  const merchant = await prisma.merchant.upsert({
    where: { slug: 'osaka-sample-minpaku-cleaning' },
    update: {},
    create: {
      nameJa: '大阪サンプル民泊清掃', nameKana: 'おおさかさんぷるみんぱくせいそう', slug: 'osaka-sample-minpaku-cleaning',
      shortDescriptionJa: '大阪市内の民泊・ホテル清掃ならお任せください',
      descriptionJa: '経験豊富なスタッフが、チェックアウト後の清掃からリネン交換、消耗品補充まで丁寧に対応します。中国語・英語でのご相談も可能です。',
      phone: '0612345678', email: 'info@example.jp', website: 'https://example.jp', lineUrl: 'https://line.me/R/ti/p/@example',
      coverUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80',
      logoUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=300&q=80',
      status: MerchantStatus.ACTIVE, rating: 4.8, reviewCount: 126, viewCount: 1842, consultCount: 138, favoriteCount: 265,
      address: { create: { postalCode: '5500015', prefectureCode: '27', prefectureName: '大阪府', municipalityCode: '27106', municipalityName: '大阪市西区', town: '南堀江', chome: '1丁目', block: '2-3', fullAddress: '大阪府大阪市西区南堀江1丁目2-3', latitude: 34.6721, longitude: 135.4962 } },
      categories: { create: [{ categoryId: 'minpaku' }, { categoryId: 'cleaning' }] },
      members: { create: { userId: merchantUser.id, isOwner: true } },
      businessHours: { create: [0,1,2,3,4,5,6].map((dayOfWeek) => ({ dayOfWeek, isClosed: dayOfWeek === 0, openTime1: dayOfWeek === 0 ? null : '09:00', closeTime1: dayOfWeek === 0 ? null : '18:00' })) },
      services: { create: [
        { categoryId: 'minpaku', nameJa: '民泊清掃スタンダード', summaryJa: '1R・1Kのお部屋におすすめ', descriptionJa: '水回り、床、ベッドメイク、ゴミ回収を含みます。', priceType: PriceType.START_FROM, priceMin: 3500, unit: '1室', status: ContentStatus.PUBLISHED, coverUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=900&q=80' },
        { categoryId: 'cleaning', nameJa: 'エアコンクリーニング', summaryJa: '家庭用壁掛けタイプ', priceType: PriceType.FIXED, priceMin: 8800, unit: '1台', status: ContentStatus.PUBLISHED, coverUrl: 'https://images.unsplash.com/photo-1631545806609-77090d36cbbc?auto=format&fit=crop&w=900&q=80' },
      ] },
      products: { create: [{ categoryId: 'cleaning', nameJa: 'ホテル仕様アメニティセット', summaryJa: '歯ブラシ・シャンプー・ボディソープ', price: 550, stock: 120, unit: 'セット', status: ContentStatus.PUBLISHED, coverUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=900&q=80' }] },
    },
  });
  await prisma.banner.upsert({ where: { id: 'welcome-osaka' }, update: {}, create: { id: 'welcome-osaka', title: '大阪の暮らしを、もっと便利に。', imageUrl: merchant.coverUrl ?? '', linkUrl: `/merchant/${merchant.slug}`, enabled: true } });
  console.info(`Seed complete. Admin: ${admin.email}, merchant: ${merchant.nameJa}`);
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
