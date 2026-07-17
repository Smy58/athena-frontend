import client from './client'

export default {
  find: (type, params = {}) => client.get('/reviews', { params: { type, ...params } }).then((r) => r.data),
  upsert: (payload) => client.post('/reviews', payload).then((r) => r.data),
}
