const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').trim().replace(/\/+$/, '');

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(payload?.message || `HTTP error! status: ${response.status}`);
  }

  return payload;
}

export const api = {
  // Generic GET request
  get: (endpoint, options) => request(endpoint, options),

  // Generic POST request
  post: (endpoint, data, options = {}) =>
    request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: JSON.stringify(data),
      ...options,
    }),

  // Generic PUT request
  put: (endpoint, data, options = {}) =>
    request(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: JSON.stringify(data),
      ...options,
    }),

  // Generic DELETE request
  delete: (endpoint, options = {}) =>
    request(endpoint, {
      method: 'DELETE',
      ...options,
    }),
};

// Specific API methods for portfolio
export const portfolioApi = {
  // Projects
  getProjects: () => api.get('/projects'),
  getProjectById: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  verifyProjectPin: (id, pin) => api.post(`/projects/${id}/verify-pin`, { pin }),

  // About
  getAbout: () => api.get('/about'),
  updateAbout: (data) => api.put('/about', data),

  // Skills
  getSkills: () => api.get('/skills'),
  createSkill: (data) => api.post('/skills', data),
  updateSkill: (id, data) => api.put(`/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/skills/${id}`),

  // Experience
  getExperience: () => api.get('/experience'),
  createExperience: (data) => api.post('/experience', data),
  updateExperience: (id, data) => api.put(`/experience/${id}`, data),
  deleteExperience: (id) => api.delete(`/experience/${id}`),

  // Feedback
  submitFeedback: (data) => api.post('/feedback', data),

  // Chatbot
  chatbot: (message) => api.post('/chatbot/chat', { message }),

  // Admin
  verifyAdminSecret: (secret) =>
    api.post(
      '/admin/verify',
      {},
      {
        headers: {
          'x-admin-secret': secret,
        },
      },
    ),
};
