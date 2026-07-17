import client from './client'

export default {
  list: () => client.get('/masters').then((r) => r.data),
  create: (data) => client.post('/masters', data).then((r) => r.data),
  update: (id, data) => client.patch(`/masters/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/masters/${id}`).then((r) => r.data),
}
