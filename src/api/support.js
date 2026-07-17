import client from './client'

export default {
  list: () => client.get('/support/topics').then((r) => r.data),
  get: (id) => client.get(`/support/topics/${id}`).then((r) => r.data),
  create: (payload) => client.post('/support/topics', payload).then((r) => r.data),
  addMessage: (id, text) => client.post(`/support/topics/${id}/messages`, { text }).then((r) => r.data),
}
