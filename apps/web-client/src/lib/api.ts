import axios from 'axios';
import type { ApiEnvelope } from '@local/types';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api/v1', timeout: 8000 });
api.interceptors.request.use((config) => { const token = localStorage.getItem('accessToken'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
export async function getData<T>(url: string): Promise<T> { const response = await api.get<ApiEnvelope<T>>(url); return response.data.data; }
