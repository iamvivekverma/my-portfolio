function trimTrailingSlashes(value) {
  return value.replace(/\/+$/, '');
}

function isLocalHostname(hostname) {
  return ['localhost', '127.0.0.1', '::1'].includes(hostname);
}

function resolveApiBase() {
  const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!configuredBase) {
    return '/api';
  }

  if (typeof window !== 'undefined') {
    try {
      const resolvedUrl = new URL(configuredBase, window.location.origin);

      // Prevent production builds from accidentally calling localhost.
      if (!isLocalHostname(window.location.hostname) && isLocalHostname(resolvedUrl.hostname)) {
        console.warn(
          'Ignoring localhost VITE_API_BASE_URL outside local development. Falling back to /api.',
        );
        return '/api';
      }
    } catch {
      // Let fetch surface invalid URL errors later.
    }
  }

  return trimTrailingSlashes(configuredBase);
}

function isHtmlResponse(text, contentType) {
  if ((contentType || '').includes('text/html')) {
    return true;
  }

  return typeof text === 'string' && /^\s*<!doctype html/i.test(text);
}

export const API_BASE = trimTrailingSlashes(resolveApiBase());

export function buildApiUrl(path) {
  return `${API_BASE}/${path.replace(/^\/+/, '')}`;
}

function createProjectAccessHeaders(accessToken) {
  return accessToken
    ? {
        'x-project-access-token': accessToken,
      }
    : {};
}

async function request(endpoint, options = {}) {
  const response = await fetch(buildApiUrl(endpoint), options);
  const text = await response.text();
  let payload = null;
  const contentType = response.headers.get('content-type') || '';

  if (text) {
    if (isHtmlResponse(text, contentType)) {
      const error = new Error(
        'API misconfigured: received HTML instead of JSON. Check VITE_API_BASE_URL or the /api dev proxy.',
      );
      error.status = response.status || 500;
      error.data = { message: text.slice(0, 200) };
      throw error;
    }

    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const error = new Error(payload?.message || payload?.error || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload;
}

export const api = {
  // Generic GET request
  get: (endpoint, options) => request(endpoint, options),

  // Generic POST request
  post: (endpoint, data, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: JSON.stringify(data),
    }),

  // Generic PUT request
  put: (endpoint, data, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: JSON.stringify(data),
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
  getProjectById: (id, { accessToken = '', headers = {}, ...options } = {}) =>
    api.get(`/projects/${id}`, {
      ...options,
      headers: {
        ...createProjectAccessHeaders(accessToken),
        ...headers,
      },
    }),
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

  // Achievements
  getAchievements: () => api.get('/achievements'),
  createAchievement: (data) => api.post('/achievements', data),
  updateAchievement: (id, data) => api.put(`/achievements/${id}`, data),
  deleteAchievement: (id) => api.delete(`/achievements/${id}`),

  // Feedback
  submitFeedback: (data) => api.post('/feedback', data),

  // Chatbot
  chatbot: (message, conversationHistory = [], options) =>
    api.post('/chatbot/chat', { message, conversationHistory }, options),

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
