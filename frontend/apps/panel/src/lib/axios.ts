import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ubes_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
