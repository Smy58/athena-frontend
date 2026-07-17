import client from './client'

export default {
  setGuild: (guild) => client.patch('/users/me/guild', { guild }).then((r) => r.data),
}
