import client from './client'

export default {
  list: () => client.get('/news').then((r) => r.data),
  detail: (id) => client.get(`/news/${id}`).then((r) => r.data),
  toggleLike: (id) => client.post(`/news/${id}/like`).then((r) => r.data),
  addComment: (id, text) => client.post(`/news/${id}/comments`, { text }).then((r) => r.data),
  removeComment: (commentId) => client.delete(`/news/comments/${commentId}`).then((r) => r.data),
  toggleCommentLike: (commentId) => client.post(`/news/comments/${commentId}/like`).then((r) => r.data),
}
