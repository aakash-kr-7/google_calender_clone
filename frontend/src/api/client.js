import axios from 'axios'

// In dev, Vite proxies /api → localhost:8000. In prod, use VITE_API_URL directly.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

// Attach JWT to every request if available in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 means token is expired or invalid — log out and redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser    = (data) => api.post('/auth/login', data)
export const loginGoogle   = (data) => api.post('/auth/google', data)
export const getMe        = ()     => api.get('/auth/me')

// Events — start/end are UTC ISO strings
export const fetchEvents   = (start, end)        => api.get('/events', { params: { start, end } })
export const createEvent   = (data, force=false) => api.post(`/events${force ? '?force=true' : ''}`, data)
export const updateEvent   = (id, data, force=false) => api.patch(`/events/${id}${force ? '?force=true' : ''}`, data)
export const deleteEvent   = (id)                => api.delete(`/events/${id}`)
export const createException = (parentId, data)  => api.post(`/events/${parentId}/exceptions`, data)

export default api
