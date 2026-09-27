import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const api = axios.create({ baseURL: `${API_URL}/v1/vault`, withCredentials: true });

export const adminApi = {
  // Analytics
  getAnalytics: () => api.get('/admin/analytics'),

  // Faculty
  listFaculty: (params) => api.get('/faculty', { params }),
  createFaculty: (data) => api.post('/faculty', data),
  updateFaculty: (id, data) => api.put(`/faculty/${id}`, data),
  archiveFaculty: (id) => api.delete(`/faculty/${id}`),
  bulkImportFaculty: (rows) => api.post('/faculty/bulk-import', { rows }),

  // Experiences (moderation)
  getModerationQueue: (params) => api.get('/admin/experiences', { params }),
  publishExperience: (id) => api.put(`/experiences/${id}`, { status: 'PUBLISHED' }),
  rejectExperience: (id, reason) => api.delete(`/experiences/${id}`, { data: { reason } }),
  deleteExperienceComment: (id) => api.delete(`/experience-comments/${id}`),

  // Research Areas
  listAreas: (params) => api.get('/areas', { params }),
  createArea: (data) => api.post('/areas', data),

  // Resources
  listResources: (params) => api.get('/resources', { params }),
  createResource: (data) => api.post('/resources', data),
  updateResource: (id, data) => api.put(`/resources/${id}`, data),
  deleteResource: (id) => api.delete(`/resources/${id}`),

  // Open Positions
  listPositions: (params) => api.get('/positions', { params }),
  createPosition: (data) => api.post('/positions', data),
  updatePosition: (id, data) => api.put(`/positions/${id}`, data),
  deletePosition: (id) => api.delete(`/positions/${id}`),

  // Discussions
  deleteDiscussion: (id) => api.delete(`/discussions/${id}`),
  listDiscussions: (params) => api.get('/discussions', { params }),
};
