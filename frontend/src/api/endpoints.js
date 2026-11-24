import apiClient from './client';

export const authAPI = {
  login: (data) => apiClient.post('/auth/login', data),
  registerFarmer: (data) => apiClient.post('/auth/register/farmer', data),
  registerCustomer: (data) => apiClient.post('/auth/register/customer', data),
  getMe: () => apiClient.get('/users/me'),
  updateProfile: (data) => apiClient.put('/users/me', data),
};

export const listingsAPI = {
  getListings: (params) => apiClient.get('/listings', { params }),
  getListing: (id) => apiClient.get(`/listings/${id}`),
  getFarmerProfile: (id) => apiClient.get(`/farmers/${id}`),
};

export const farmerAPI = {
  getYields: () => apiClient.get('/farmer/yields'),
  createYield: (data) => apiClient.post('/farmer/yields', data),
  updateYield: (id, data) => apiClient.put(`/farmer/yields/${id}`, data),
  deleteYield: (id) => apiClient.delete(`/farmer/yields/${id}`),
  getYieldAnalytics: () => apiClient.get('/farmer/yields/analytics'),

  getMyListings: () => apiClient.get('/farmer/listings'),
  createListing: (data) => apiClient.post('/farmer/listings', data),
  updateListing: (id, data) => apiClient.put(`/farmer/listings/${id}`, data),
  deleteListing: (id) => apiClient.delete(`/farmer/listings/${id}`),

  getOrders: (params) => apiClient.get('/farmer/orders', { params }),
  updateOrderStatus: (id, status) => apiClient.patch(`/farmer/orders/${id}/status`, { status }),
  getReviews: () => apiClient.get('/farmer/reviews'),
};

export const diseaseAPI = {
  predict: (formData) => apiClient.post('/disease/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHistory: () => apiClient.get('/disease/history'),
};

export const priceAPI = {
  predictPrice: (crop, district) => apiClient.get(`/prices/predict?crop=${crop}&district=${district}`),
};

export const cartAPI = {
  getCart: () => apiClient.get('/cart'),
  addItem: (data) => apiClient.post('/cart', data),
  updateItem: (id, data) => apiClient.put(`/cart/items/${id}`, data),
  removeItem: (id) => apiClient.delete(`/cart/items/${id}`),
  clearCart: () => apiClient.delete('/cart'),
};

export const orderAPI = {
  createOrder: (data) => apiClient.post('/orders', data),
  getMyOrders: () => apiClient.get('/orders'),
  getOrder: (id) => apiClient.get(`/orders/${id}`),
  submitReview: (orderId, data) => apiClient.post(`/orders/${orderId}/review`, data),
  raiseDispute: (orderId, data) => apiClient.post(`/orders/${orderId}/dispute`, data),
};

export const adminAPI = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
  getPendingFarmers: () => apiClient.get('/admin/farmers/pending'),
  verifyFarmer: (id, action, rejection_reason) => apiClient.post(`/admin/farmers/${id}/verify`, { action, rejection_reason }),
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  updateUserStatus: (id, status) => apiClient.patch(`/admin/users/${id}/status`, { status }),
  getTransactions: (params) => apiClient.get('/admin/transactions', { params }),
  getDisputes: () => apiClient.get('/admin/disputes'),
  resolveDispute: (id, data) => apiClient.patch(`/admin/disputes/${id}`, data),
  removeListing: (id) => apiClient.delete(`/admin/listings/${id}`),
  hideReview: (id) => apiClient.patch(`/admin/reviews/${id}/hide`),
  getDemandAnalytics: () => apiClient.get('/admin/analytics/demand'),
  getHotspotsAnalytics: () => apiClient.get('/admin/analytics/disease-hotspots'),
  getSalesAnalytics: () => apiClient.get('/admin/analytics/sales'),
  broadcast: (data) => apiClient.post('/admin/notifications/broadcast', data),
  getLogs: () => apiClient.get('/admin/logs'),
};

export const notificationAPI = {
  getNotifications: () => apiClient.get('/notifications'),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`),
};
