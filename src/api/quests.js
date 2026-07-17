import client from './client'

export default {
  active: () => client.get('/quests/active').then((r) => r.data),
  completed: () => client.get('/quests/completed').then((r) => r.data),
  create: (payload) => client.post('/quests', payload).then((r) => r.data),
  toggleSignup: (id) => client.post(`/quests/${id}/signup`).then((r) => r.data),
  complete: (id) => client.post(`/quests/${id}/complete`).then((r) => r.data),
  remove: (id) => client.delete(`/quests/${id}`).then((r) => r.data),
}
