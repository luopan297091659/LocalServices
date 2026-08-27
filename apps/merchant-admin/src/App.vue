<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import axios from 'axios';
import type { ApiEnvelope, AuthResult, Merchant, Product, Service } from '@local/types';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api/v1' });
const demoMode = import.meta.env.DEV;
const token = ref(localStorage.getItem('merchantToken'));
api.interceptors.request.use((config) => {
  if (token.value) config.headers.Authorization = `Bearer ${token.value}`;
  return config;
});

const page = ref('dashboard');
const loading = ref(false);
const error = ref('');
const email = ref(demoMode ? 'merchant@machiservice.jp' : '');
const password = ref(demoMode ? 'Demo1234!' : '');
const profile = ref<Merchant | null>(null);
const services = ref<Service[]>([]);
const products = ref<Product[]>([]);
const stats = ref({ viewCount: 0, consultCount: 0, favoriteCount: 0, serviceCount: 0, productCount: 0, conversationCount: 0 });
const serviceForm = ref({ nameJa: '', summaryJa: '', priceType: 'START_FROM', priceMin: 3500, taxIncluded: true, status: 'PUBLISHED' });
const productForm = ref({ nameJa: '', summaryJa: '', price: 1000, stock: 10, taxIncluded: true, status: 'PUBLISHED' });
const showForm = ref(false);
const menus: Array<[string, string, string]> = [
  ['dashboard', '▦', 'ダッシュボード'], ['profile', '⌂', '店舗情報'], ['services', '◇', 'サービス管理'],
  ['products', '□', '商品管理'], ['media', '▧', '写真・動画'], ['hours', '◷', '営業時間'],
  ['chat', '✉', '問い合わせ'], ['statistics', '↗', 'アクセス分析'], ['settings', '⚙', '設定'],
];
const title = computed(() => menus.find((menu) => menu[0] === page.value)?.[2] ?? '');

async function login(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const response = await api.post<ApiEnvelope<AuthResult>>('/auth/login', { identifier: email.value, password: password.value });
    token.value = response.data.data.accessToken;
    localStorage.setItem('merchantToken', response.data.data.accessToken);
    await load();
  } catch {
    error.value = 'メールアドレスまたはパスワードを確認してください。';
  } finally {
    loading.value = false;
  }
}

async function load(): Promise<void> {
  try {
    const [profileResult, serviceResult, productResult, dashboardResult] = await Promise.all([
      api.get<ApiEnvelope<Merchant>>('/merchant/profile'), api.get<ApiEnvelope<Service[]>>('/merchant/services'),
      api.get<ApiEnvelope<Product[]>>('/merchant/products'), api.get<ApiEnvelope<typeof stats.value>>('/merchant/dashboard'),
    ]);
    profile.value = profileResult.data.data;
    services.value = serviceResult.data.data;
    products.value = productResult.data.data;
    stats.value = dashboardResult.data.data;
  } catch {
    if (demoMode) {
      profile.value = { id: 'demo', nameJa: '大阪サンプル民泊清掃', status: 'ACTIVE', rating: 4.8, reviewCount: 126, favoriteCount: 265, address: { fullAddress: '大阪府大阪市西区南堀江1丁目2-3' }, shortDescriptionJa: '大阪市内の民泊・ホテル清掃ならお任せください' };
      services.value = [{ id: '1', nameJa: '民泊清掃スタンダード', summaryJa: '1R・1Kのお部屋におすすめ', priceType: 'START_FROM', priceMin: 3500, taxIncluded: true, status: 'PUBLISHED' }];
      products.value = [{ id: '1', nameJa: 'ホテル仕様アメニティセット', price: 550, stock: 120, status: 'PUBLISHED' }];
    } else {
      error.value = 'データを取得できませんでした。しばらくしてから再度お試しください。';
    }
  }
}

async function createService(): Promise<void> {
  try {
    const result = await api.post<ApiEnvelope<Service>>('/merchant/services', serviceForm.value);
    services.value.push(result.data.data);
  } catch {
    if (!demoMode) { error.value = 'サービスを保存できませんでした。'; return; }
    services.value.push({ id: crypto.randomUUID(), ...serviceForm.value });
  }
  showForm.value = false;
  serviceForm.value.nameJa = '';
}

async function createProduct(): Promise<void> {
  try {
    const result = await api.post<ApiEnvelope<Product>>('/merchant/products', productForm.value);
    products.value.push(result.data.data);
  } catch {
    if (!demoMode) { error.value = '商品を保存できませんでした。'; return; }
    products.value.push({ id: crypto.randomUUID(), ...productForm.value });
  }
  showForm.value = false;
  productForm.value.nameJa = '';
}

function logout(): void {
  token.value = null;
  localStorage.removeItem('merchantToken');
}

onMounted(() => { if (token.value) void load(); });
</script>

<template>
  <div v-if="!token" class="login-page">
    <div class="login-art">
      <div class="logo"><i>ま</i><b>まちサービス<small>店舗管理</small></b></div>
      <div><span>GROW WITH YOUR TOWN</span><h1>あなたのお店の魅力を、<br>もっと多くの人へ。</h1><p>店舗情報、サービス、問い合わせをひとつの場所で。</p></div>
    </div>
    <form @submit.prevent="login">
      <span class="kicker">MERCHANT PORTAL</span><h2>店舗管理にログイン</h2><p>{{ demoMode ? 'デモアカウントが入力済みです。' : '登録済みの管理者アカウントでログインしてください。' }}</p>
      <label>メールアドレス<input v-model="email"></label><label>パスワード<input v-model="password" type="password"></label>
      <b v-if="error" class="error">{{ error }}</b><button :disabled="loading">{{ loading ? '確認中…' : 'ログイン' }}</button><a>パスワードをお忘れですか？</a>
    </form>
  </div>
  <div v-else class="app">
    <aside>
      <div class="logo"><i>ま</i><b>まちサービス<small>店舗管理</small></b></div>
      <nav><button v-for="menu in menus" :key="menu[0]" :class="{ active: page === menu[0] }" @click="page = menu[0]"><i>{{ menu[1] }}</i>{{ menu[2] }}</button></nav>
      <div class="support">お困りですか？<small>サポートセンター</small></div>
    </aside>
    <main>
      <header><div><span class="kicker">MERCHANT PORTAL</span><h1>{{ title }}</h1></div><div class="head-actions"><a href="/" target="_blank">店舗ページを表示 ↗</a><button @click="logout">ログアウト</button></div></header>
      <section v-if="page === 'dashboard'">
        <div class="welcome"><div><span>おはようございます</span><h2>{{ profile?.nameJa }}</h2><p>店舗情報は公開中です。今日もお客様との出会いを大切に。</p></div><b>公開中 <small>●</small></b></div>
        <div class="stats"><article><span>本日の閲覧数</span><strong>48</strong><small>↗ 12.5% 前日比</small></article><article><span>今月の閲覧数</span><strong>{{ stats.viewCount.toLocaleString() }}</strong><small>↗ 8.2% 前月比</small></article><article><span>問い合わせ</span><strong>{{ stats.consultCount }}</strong><small>今月 24件</small></article><article><span>お気に入り</span><strong>{{ stats.favoriteCount }}</strong><small>↗ 18 今月</small></article></div>
        <div class="columns">
          <article class="panel"><div class="panel-head"><h3>人気サービス</h3><button @click="page = 'services'">すべて見る</button></div><div v-for="service in services" :key="service.id" class="rank"><b>{{ service.nameJa }}</b><span>{{ service.priceMin?.toLocaleString() }}円〜</span><em>閲覧 428</em></div></article>
          <article class="panel"><div class="panel-head"><h3>最近の問い合わせ</h3><button @click="page = 'chat'">すべて見る</button></div><div class="inquiry"><i>山</i><div><b>山田 花子</b><p>来週土曜日の清掃は可能ですか？</p></div><small>10分前</small></div><div class="inquiry"><i>佐</i><div><b>佐藤 健</b><p>見積もりをお願いしたいです。</p></div><small>2時間前</small></div></article>
        </div>
      </section>
      <section v-else-if="page === 'profile' && profile" class="panel form-panel">
        <h3>店舗基本情報</h3><div class="form-grid"><label>店舗名<input v-model="profile.nameJa"></label><label>公開状態<input :value="profile.status" disabled></label><label class="wide">紹介文<textarea v-model="profile.shortDescriptionJa"></textarea></label><label v-if="profile.address" class="wide">住所<input v-model="profile.address.fullAddress"></label></div><button class="primary">変更を保存</button>
      </section>
      <section v-else-if="page === 'services' || page === 'products'" class="panel list-panel">
        <div class="panel-head"><div><h3>{{ title }}</h3><p>公開する内容と料金を管理します。</p></div><button class="primary" @click="showForm = true">＋ 新規作成</button></div>
        <table><thead><tr><th>名称</th><th>価格</th><th>状態</th><th>在庫</th><th></th></tr></thead><tbody><tr v-for="item in page === 'services' ? services : products" :key="item.id"><td><b>{{ item.nameJa }}</b><small>{{ item.summaryJa }}</small></td><td>{{ (item.priceMin ?? item.price)?.toLocaleString() }}円{{ item.priceType === 'START_FROM' ? '〜' : '' }}</td><td><span class="published">公開中</span></td><td>{{ item.stock ?? '—' }}</td><td>•••</td></tr></tbody></table>
      </section>
      <section v-else class="panel placeholder"><span>{{ menus.find(menu => menu[0] === page)?.[1] }}</span><h2>{{ title }}</h2><p>この画面はAPI連携済みのMVPプレースホルダーです。</p></section>
    </main>
    <div v-if="showForm" class="modal" @click.self="showForm = false">
      <form class="modal-card" @submit.prevent="page === 'services' ? createService() : createProduct()">
        <button type="button" class="close" @click="showForm = false">×</button><span class="kicker">NEW CONTENT</span><h2>{{ page === 'services' ? 'サービス' : '商品' }}を追加</h2>
        <template v-if="page === 'services'"><label>名称<input v-model="serviceForm.nameJa" required></label><label>説明<input v-model="serviceForm.summaryJa"></label><label>価格（円）<input v-model.number="serviceForm.priceMin" type="number" min="0"></label></template>
        <template v-else><label>名称<input v-model="productForm.nameJa" required></label><label>説明<input v-model="productForm.summaryJa"></label><label>価格（円）<input v-model.number="productForm.price" type="number" min="0"></label></template>
        <button class="primary">公開する</button>
      </form>
    </div>
  </div>
</template>
