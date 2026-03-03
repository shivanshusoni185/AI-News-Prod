import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const newsApi = {
  getAll: (search = '', tag = '', page = 1, limit = 12) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tag) params.append('tag', tag);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return api.get(`/news?${params.toString()}`);
  },
  getById: (id) => api.get(`/news/${id}`),
  getBySlug: (slug) => api.get(`/news/by-slug/${slug}`),
  getStats: (id) => api.get(`/news/${id}/stats`),
  getRelated: (id, limit = 3) => api.get(`/news/${id}/related?limit=${limit}`),
  getAllTags: () => api.get(`/news/tags/all`),
  recordView: (newsId) => api.post(`/news/view`, { news_id: newsId }),
  addReaction: (newsId, reactionType) => api.post(`/news/reaction`, { 
    news_id: newsId, 
    reaction_type: reactionType 
  }),
};

export const newsletterApi = {
  subscribe: (email) => api.post('/newsletter', { email }),
  unsubscribe: (email) => api.delete(`/newsletter/${email}`),
};

export const adminApi = {
  login: (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    return api.post('/admin/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  getAllNews: () => api.get('/admin/news'),
  createNews: (formData) => api.post('/admin/news', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateNews: (id, formData) => api.put(`/admin/news/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteNews: (id) => api.delete(`/admin/news/${id}`),
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // Images are now served from database via API endpoint
  if (imagePath.startsWith('/')) {
    return `/api${imagePath}`;
  }
  return `/api${imagePath}`;
};

export default api;
