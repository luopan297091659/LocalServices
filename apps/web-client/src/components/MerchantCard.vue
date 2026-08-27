<script setup lang="ts">
import type { Merchant } from '@local/types';
defineProps<{ merchant: Merchant }>();
const price = (merchant: Merchant): string => merchant.services?.[0]?.priceMin ? `${merchant.services[0].priceMin.toLocaleString('ja-JP')}円〜` : '料金を相談';
</script>
<template>
  <RouterLink :to="`/merchant/${merchant.slug ?? merchant.id}`" class="merchant-card">
    <div class="merchant-image" :style="{ backgroundImage: `url(${merchant.coverUrl})` }"><span v-if="merchant.distance" class="distance">{{ merchant.distance < 1000 ? `${merchant.distance}m` : `${(merchant.distance/1000).toFixed(1)}km` }}</span><button aria-label="お気に入り">♡</button></div>
    <div class="merchant-body"><div class="eyebrow">{{ merchant.categories?.map(item => item.category.nameJa).join('・') }}</div><h3>{{ merchant.nameJa }}</h3><p>{{ merchant.shortDescriptionJa }}</p><div class="meta"><span class="stars">★ {{ Number(merchant.rating).toFixed(1) }}</span><span>({{ merchant.reviewCount }}件)</span><span>・ {{ merchant.address?.municipalityName }}</span></div><div class="card-foot"><strong>{{ price(merchant) }}</strong><span class="open">営業中</span></div></div>
  </RouterLink>
</template>
