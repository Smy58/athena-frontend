import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

// Attach the JWT to every request once the user is logged in.
// Reads directly from localStorage to avoid a circular import with the store.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('athena_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default client
