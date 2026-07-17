import client from './client'

export default {
  meta: () => client.get('/schedule/meta').then((r) => r.data),
  games: () => client.get('/schedule/games').then((r) => r.data),
  createGame: (data) => client.post('/schedule/games', data).then((r) => r.data),
  updateGame: (id, data) => client.patch(`/schedule/games/${id}`, data).then((r) => r.data),
  removeGame: (id) => client.delete(`/schedule/games/${id}`).then((r) => r.data),
  history: () => client.get('/schedule/history').then((r) => r.data),
  createHistory: (data) => client.post('/schedule/history', data).then((r) => r.data),
  updateHistory: (id, data) => client.patch(`/schedule/history/${id}`, data).then((r) => r.data),
  removeHistory: (id) => client.delete(`/schedule/history/${id}`).then((r) => r.data),
}
