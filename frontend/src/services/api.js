import axios from 'axios'

const api = axios.create({ 
  baseURL: 'http://localhost:8081/api' 
})

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('tb_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, error => Promise.reject(error))

// Global 401 handler
api.interceptors.response.use(
  response => response,
  error => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('tb_token')
      localStorage.removeItem('tb_user')
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: data => api.post('/auth/register', data),
  login:    data => api.post('/auth/login',    data),
}

// ── Categories ────────────────────────────────────────────────────────────────
export const categoryApi = {
  getAll:  ()         => api.get('/categories'),
  create:  data       => api.post('/categories', data),
  update:  (id, data) => api.put(`/categories/${id}`, data),
  delete:  id         => api.delete(`/categories/${id}`),
}

// ── Questions ─────────────────────────────────────────────────────────────────
export const questionApi = {
  getAll:  params     => api.get('/questions', { params }),
  getById: id         => api.get(`/questions/${id}`),
  create:  data       => api.post('/questions', data),
  update:  (id, data) => api.put(`/questions/${id}`, data),
  delete:  id         => api.delete(`/questions/${id}`),
}

// ── Tests ─────────────────────────────────────────────────────────────────────
export const testApi = {
  getAll:  ()         => api.get('/tests'),
  getMy:   ()         => api.get('/tests/my'),
  getById: id         => api.get(`/tests/${id}`),
  create:  data       => api.post('/tests', data),
  update:  (id, data) => api.put(`/tests/${id}`, data),
  delete:  id         => api.delete(`/tests/${id}`),
}

// ── Attempts ──────────────────────────────────────────────────────────────────
export const attemptApi = {
  start:     testId        => api.post(`/attempts/start/${testId}`),
  submit:    (id, type)    => api.post(`/attempts/${id}/submit`, null, { params: { type: type ?? 'manual' } }),
  getMy:     ()            => api.get('/attempts/my'),
  getById:   id            => api.get(`/attempts/${id}`),
  getByTest: testId        => api.get(`/attempts/test/${testId}`),
}

// ── Responses ─────────────────────────────────────────────────────────────────
export const responseApi = {
  save:        (attemptId, data) => api.post(`/responses/attempt/${attemptId}`, data),
  getByAttempt: attemptId        => api.get(`/responses/attempt/${attemptId}`),
}

// ── Results ───────────────────────────────────────────────────────────────────
export const resultApi = {
  compute:      attemptId => api.post(`/results/compute/${attemptId}`),
  getByAttempt: attemptId => api.get(`/results/attempt/${attemptId}`),
  leaderboard:  testId    => api.get(`/results/leaderboard/${testId}`),
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  dashboard:          () => api.get('/analytics/dashboard'),
  questionPerformance:() => api.get('/analytics/question-performance'),
}
// ── Admin (User Management) ───────────────────────────────────────────────────
export const adminApi = {
  getUsers:   ()      => api.get('/admin/users'),
  deleteUser: (id)    => api.delete(`/admin/users/${id}`),
}
export default api
