import { defineStore } from 'pinia'
import authApi from '../api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('athena_token') || null,
    user: JSON.parse(localStorage.getItem('athena_user') || 'null'),
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
  },

  actions: {
    async register(payload) {
      const data = await authApi.register(payload)
      this.setSession(data)
      await this.refreshProfile()
    },

    async login(payload) {
      const data = await authApi.login(payload)
      this.setSession(data)
      await this.refreshProfile()
    },

    async refreshProfile() {
      this.user = await authApi.me()
      localStorage.setItem('athena_user', JSON.stringify(this.user))
    },

    setSession(data) {
      this.token = data.token
      this.user = data.user
      localStorage.setItem('athena_token', data.token)
      localStorage.setItem('athena_user', JSON.stringify(data.user))
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('athena_token')
      localStorage.removeItem('athena_user')
    },
  },
})
