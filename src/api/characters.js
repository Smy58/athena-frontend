import client from './client'

export default {
  list: () => client.get('/characters').then((r) => r.data),
  get: (id) => client.get(`/characters/${id}`).then((r) => r.data),
  create: (payload) => client.post('/characters', payload).then((r) => r.data),
  update: (id, payload) => client.patch(`/characters/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/characters/${id}`).then((r) => r.data),
}
