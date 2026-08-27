<script setup lang="ts">
import { useAuthStore } from './stores/auth';
const auth = useAuthStore();
</script>
<template>
  <header class="site-header">
    <RouterLink to="/" class="brand"><span class="brand-mark">ま</span><span>まちサービス<small>LOCAL LIFE, BETTER</small></span></RouterLink>
    <nav><RouterLink to="/search">お店を探す</RouterLink><RouterLink to="/favorites">お気に入り</RouterLink><RouterLink to="/chat">問い合わせ</RouterLink></nav>
    <RouterLink v-if="!auth.loggedIn" to="/login" class="outline-button">ログイン</RouterLink>
    <button v-else class="user-chip" @click="auth.logout">{{ auth.user?.nickname ?? 'マイページ' }} <span>↗</span></button>
  </header>
  <main><RouterView /></main>
  <footer><div class="brand light"><span class="brand-mark">ま</span><span>まちサービス<small>LOCAL LIFE, BETTER</small></span></div><p>暮らしの近くに、頼れるプロを。</p><div><a>利用規約</a><a>プライバシーポリシー</a><a>運営会社</a><a>お問い合わせ</a></div><small>© 2026 まちサービス</small></footer>
</template>
