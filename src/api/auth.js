import client from './client'

export default {
  register: (payload) => client.post('/auth/register', payload).then((r) => r.data),
  login: (payload) => client.post('/auth/login', payload).then((r) => r.data),
  me: () => client.get('/users/me').then((r) => r.data),
}
