<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Category, Merchant } from '@local/types';
import MerchantCard from '../components/MerchantCard.vue';
import { getData } from '../lib/api';
import { demoCategories, demoMerchants } from '../data/demo';
const demoMode = import.meta.env.DEV;
const merchantAdminUrl = `${import.meta.env.BASE_URL}merchant-admin/`;
const router = useRouter(); const keyword = ref(''); const categories = ref<Category[]>(demoMode ? demoCategories : []); const merchants = ref<Merchant[]>(demoMode ? demoMerchants : []); const apiOffline = ref(false);
function search(): void { void router.push({ path:'/search', query:{ keyword:keyword.value, prefectureCode:'27' } }); }
onMounted(async () => { try { const [remoteCategories, result] = await Promise.all([getData<Category[]>('/categories'), getData<{items:Merchant[]}>('/merchants?prefectureCode=27&pageSize=6')]); categories.value = remoteCategories.slice(0,8); merchants.value = result.items; } catch { apiOffline.value = true; } });
</script>
<template>
  <section class="hero"><div class="hero-copy"><span class="hero-kicker">OSAKA · LOCAL SERVICE GUIDE</span><h1>暮らしの近くに、<br><em>頼れるプロ</em>を。</h1><p>掃除、引越し、修理から美容まで。<br>あなたの街の信頼できるお店が見つかります。</p><form class="hero-search" @submit.prevent="search"><label><span>⌖</span><select aria-label="地域"><option value="27">大阪府</option></select></label><label class="keyword"><span>⌕</span><input v-model="keyword" placeholder="店舗・サービスを検索"></label><button>検索する</button></form><small v-if="apiOffline" class="demo-notice">{{ demoMode ? 'デモ表示中 — APIを起動するとライブデータに切り替わります' : '現在データを取得できません。しばらくしてから再度お試しください。' }}</small><div class="trust-row"><span><b>2,400+</b> 掲載店舗</span><span><b>4.8</b> 平均評価</span><span><b>98%</b> 満足度</span></div></div><div class="hero-visual"><div class="hero-photo"></div><div class="floating-card"><span>✓</span><div><b>本人確認済み</b><small>安心して相談できます</small></div></div><div class="hero-stamp">OSAKA<br><b>LOCAL</b><br>2026</div></div></section>
  <section class="section categories-section"><div class="section-head"><div><span class="eyebrow">CATEGORY</span><h2>何をお探しですか？</h2></div><RouterLink to="/search">すべて見る →</RouterLink></div><div class="category-grid"><RouterLink v-for="category in categories" :key="category.id" :to="{path:'/search',query:{categoryId:category.id,prefectureCode:'27'}}" class="category-tile"><span>{{ category.icon ?? '◌' }}</span><b>{{ category.nameJa }}</b><small>詳しく見る ↗</small></RouterLink></div></section>
  <section class="section featured"><div class="section-head"><div><span class="eyebrow">RECOMMENDED IN OSAKA</span><h2>大阪のおすすめ店舗</h2><p>地域で選ばれている、信頼のお店をご紹介します。</p></div><RouterLink to="/search">もっと見る →</RouterLink></div><div class="merchant-grid"><MerchantCard v-for="merchant in merchants" :key="merchant.id" :merchant="merchant" /></div></section>
  <section class="cta"><div><span class="eyebrow">FOR LOCAL BUSINESSES</span><h2>あなたのお店を、<br>もっと地域の人へ。</h2><p>無料で店舗情報を掲載。サービスの魅力を発信して、新しいお客様と出会いませんか？</p><a :href="merchantAdminUrl" class="cta-button">店舗を無料で登録する <span>→</span></a></div><div class="cta-art"><span>ま</span><i>LOCAL BUSINESS<br>GROW TOGETHER</i></div></section>
</template>
