import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import SearchView from './views/SearchView.vue';
import MerchantView from './views/MerchantView.vue';
import LoginView from './views/LoginView.vue';
import FavoritesView from './views/FavoritesView.vue';
import ChatView from './views/ChatView.vue';
export const router = createRouter({ history: createWebHistory(), scrollBehavior: () => ({ top: 0 }), routes: [
  { path: '/', component: HomeView }, { path: '/search', component: SearchView }, { path: '/merchant/:id', component: MerchantView },
  { path: '/login', component: LoginView }, { path: '/favorites', component: FavoritesView }, { path: '/chat', component: ChatView },
] });
