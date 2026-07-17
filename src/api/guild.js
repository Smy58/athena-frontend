import client from './client'

export default {
  logContract: (guild, rank) => client.post('/guild/contract', { guild, rank }).then((r) => r.data),
  jar: (guild) => client.get(`/guild/${guild}/jar`).then((r) => r.data),
  members: (guild) => client.get(`/users/guild/${guild}/members`).then((r) => r.data),
  info: () => client.get('/guild/info').then((r) => r.data),
  updateInfo: (guild, data) => client.patch(`/guild/info/${guild}`, data).then((r) => r.data),
  ranks: () => client.get('/guild/ranks').then((r) => r.data),
  createRank: (data) => client.post('/guild/ranks', data).then((r) => r.data),
  updateRank: (value, data) => client.patch(`/guild/ranks/${value}`, data).then((r) => r.data),
  removeRank: (value) => client.delete(`/guild/ranks/${value}`).then((r) => r.data),
}
