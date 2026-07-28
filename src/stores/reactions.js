import { defineStore } from 'pinia'
import shopApi from '../api/shop'

// Lazily loads the id -> { name, svg, price } map for equippable reactions once,
// so any component can render a placed/equipped reaction without refetching.
export const useReactionsStore = defineStore('reactions', {
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
        for (const r of cat.reactions) map[r.id] = { name: r.name, svg: r.svg, price: r.price }
        this.map = map
        this.loaded = true
      })
      await this.loading
    },
  },
})
