import client from './client'

export default {
  list: () => client.get('/faq').then((r) => r.data),
  create: (data) => client.post('/faq', data).then((r) => r.data),
  update: (id, data) => client.patch(`/faq/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/faq/${id}`).then((r) => r.data),
}
