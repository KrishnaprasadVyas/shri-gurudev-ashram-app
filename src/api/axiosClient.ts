import axios from 'axios';
import { getSupabaseClient } from '../lib/supabase';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:3000',
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const { data } = await getSupabaseClient().auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
