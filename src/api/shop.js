import client from './client'

export default {
  catalog: () => client.get('/shop/catalog').then((r) => r.data),
  buyTitle: (id) => client.post(`/shop/titles/${id}/buy`).then((r) => r.data),
  selectTitle: (id) => client.patch(`/shop/titles/${id}/select`).then((r) => r.data),
  buyConsumable: (category, id) => client.post(`/shop/${category}/${id}/buy`).then((r) => r.data),
  pendingPurchases: () => client.get('/shop/purchases/pending').then((r) => r.data),
  redeem: (id) => client.patch(`/shop/purchases/${id}/redeem`).then((r) => r.data),
}
