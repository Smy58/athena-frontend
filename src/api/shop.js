import client from './client'

export default {
  catalog: () => client.get('/shop/catalog').then((r) => r.data),
  buyTitle: (id) => client.post(`/shop/titles/${id}/buy`).then((r) => r.data),
  selectTitle: (id) => client.patch(`/shop/titles/${id}/select`).then((r) => r.data),
  checkout: (items, paymentMethod, comment) => client.post('/shop/cart/checkout', { items, paymentMethod, comment }).then((r) => r.data),
  myPurchases: () => client.get('/shop/purchases/mine').then((r) => r.data),
  buyReaction: (id) => client.post(`/shop/reactions/${id}/buy`).then((r) => r.data),
  selectReaction: (id) => client.patch(`/shop/reactions/${id}/select`).then((r) => r.data),
}
