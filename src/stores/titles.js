import { defineStore } from 'pinia'
import shopApi from '../api/shop'

// Lazily loads the id -> { name, color } map for equippable titles once,
// so any component can look up a player's activeTitle without refetching.
export const useTitlesStore = defineStore('titles', {
  state: () => ({
    map: {},
    loaded: false,
    loading: null,
  }),

  actions: {
    async ensureLoaded() {
      if (this.loaded) return
      if (this.loading) return this.loading
      this.loading = shopApi.catalog().then((cat) => {
        const map = {}
        for (const section of cat.titleSections) {
          for (const t of section.titles) map[t.id] = { name: t.name, color: t.color }
        }
        this.map = map
        this.loaded = true
      })
      await this.loading
    },
  },
})
