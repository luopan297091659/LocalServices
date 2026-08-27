import { defineStore } from 'pinia';
import type { ApiEnvelope, AuthResult, User } from '@local/types';
import { api } from '../lib/api';
export const useAuthStore = defineStore('auth', {
  state: () => ({ user: JSON.parse(localStorage.getItem('user') ?? 'null') as User | null }),
  getters: { loggedIn: (state) => Boolean(state.user) },
  actions: {
    async login(identifier: string, password: string) { const { data } = await api.post<ApiEnvelope<AuthResult>>('/auth/login', { identifier, password }); this.user = data.data.user; localStorage.setItem('user', JSON.stringify(this.user)); localStorage.setItem('accessToken', data.data.accessToken); localStorage.setItem('refreshToken', data.data.refreshToken); },
    logout() { this.user = null; localStorage.removeItem('user'); localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); },
  },
});
