import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const researchAPI = {
  query: async (query: string, mode: string = 'deep') => {
    const res = await apiClient.post('/api/v1/research/query', { query, mode });
    return res.data;
  },
  getSources: async () => {
    const res = await apiClient.get('/api/v1/sources');
    return res.data;
  },
  getMemory: async () => {
    const res = await apiClient.get('/api/v1/memory');
    return res.data;
  },
  getStats: async () => {
    const res = await apiClient.get('/api/v1/stats');
    return res.data;
  },
  getSession: async (sessionId: string) => {
    const res = await apiClient.get(`/api/v1/research/session/${sessionId}`);
    return res.data;
  },
};