// ============================================
// MARKET PRO - API Service (Frontend)
// ============================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// ============================================
// Token Management
// ============================================
class TokenManager {
  static getAccessToken() {
    return localStorage.getItem('accessToken');
  }
  
  static getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }
  
  static setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }
  
  static clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
  
  static isTokenExpired(token) {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

// ============================================
// API Client
// ============================================
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.refreshPromise = null;
  }

  // Refresh the access token
  async refreshAccessToken() {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      TokenManager.clearTokens();
      window.location.href = '/login';
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    TokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
    return data.data.accessToken;
  }

  // Build headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (includeAuth) {
      const token = TokenManager.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Main request method
  async request(endpoint, options = {}) {
    const { method = 'GET', body, auth = true, params } = options;

    // Build URL with query params
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value);
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const config = {
      method,
      headers: this.getHeaders(auth)
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      let response = await fetch(url, config);

      // Handle 401 - Try token refresh
      if (response.status === 401 && auth) {
        // Prevent multiple refresh attempts
        if (!this.refreshPromise) {
          this.refreshPromise = this.refreshAccessToken().finally(() => {
            this.refreshPromise = null;
          });
        }

        try {
          await this.refreshPromise;
          // Retry with new token
          config.headers = this.getHeaders(true);
          response = await fetch(url, config);
        } catch {
          throw new Error('Session expired');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'API request failed');
        error.status = response.status;
        error.errors = data.errors;
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // HTTP method shortcuts
  get(endpoint, params) {
    return this.request(endpoint, { method: 'GET', params });
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Create singleton instance
const api = new ApiClient(API_BASE_URL);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: (email, password) => 
    api.request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  
  logout: () => 
    api.post('/auth/logout'),
  
  refreshToken: () => 
    api.refreshAccessToken(),
  
  getMe: () => 
    api.get('/auth/me'),
  
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword })
};

// ============================================
// USERS API
// ============================================
export const usersAPI = {
  getAll: (params) => 
    api.get('/users', params),
  
  getById: (id) => 
    api.get(`/users/${id}`),
  
  create: (data) => 
    api.post('/users', data),
  
  update: (id, data) => 
    api.put(`/users/${id}`, data),
  
  toggleStatus: (id) => 
    api.patch(`/users/${id}/toggle-status`)
};

// ============================================
// PRODUCTS API
// ============================================
export const productsAPI = {
  getAll: (params) => 
    api.get('/products', params),
  
  getById: (id) => 
    api.get(`/products/${id}`),
  
  getByBarcode: (barcode) => 
    api.get(`/products/barcode/${barcode}`),
  
  create: (data) => 
    api.post('/products', data),
  
  update: (id, data) => 
    api.put(`/products/${id}`, data),
  
  delete: (id) => 
    api.delete(`/products/${id}`),
  
  addStock: (id, quantity, reason) => 
    api.post(`/products/${id}/stock/add`, { quantity, reason }),
  
  deductStock: (id, quantity, reason) => 
    api.post(`/products/${id}/stock/deduct`, { quantity, reason }),
  
  getStats: () => 
    api.get('/products/stats/overview'),
  
  getLowStock: () => 
    api.get('/products', { lowStock: true }),
  
  search: (query) => 
    api.get('/products', { search: query })
};

// ============================================
// STOCKS API
// ============================================
export const stocksAPI = {
  getMovements: (params) => 
    api.get('/stocks/movements', params),
  
  getProductHistory: (productId) => 
    api.get(`/stocks/products/${productId}/history`),
  
  getAlerts: () => 
    api.get('/stocks/alerts'),
  
  recordMovement: (data) => 
    api.post('/stocks/movements', data)
};

// ============================================
// CLIENTS API
// ============================================
export const clientsAPI = {
  getAll: (params) => 
    api.get('/clients', params),
  
  getById: (id) => 
    api.get(`/clients/${id}`),
  
  create: (data) => 
    api.post('/clients', data),
  
  update: (id, data) => 
    api.put(`/clients/${id}`, data),
  
  delete: (id) => 
    api.delete(`/clients/${id}`),
  
  addNote: (id, content) => 
    api.post(`/clients/${id}/notes`, { content }),
  
  getStats: (id) => 
    api.get(`/clients/${id}/stats`),
  
  search: (query) => 
    api.get('/clients', { search: query })
};

// ============================================
// SUPPLIERS API
// ============================================
export const suppliersAPI = {
  getAll: (params) => 
    api.get('/suppliers', params),
  
  getById: (id) => 
    api.get(`/suppliers/${id}`),
  
  create: (data) => 
    api.post('/suppliers', data),
  
  update: (id, data) => 
    api.put(`/suppliers/${id}`, data),
  
  delete: (id) => 
    api.delete(`/suppliers/${id}`),
  
  search: (query) => 
    api.get('/suppliers', { search: query })
};

// ============================================
// ORDERS API
// ============================================
export const ordersAPI = {
  getAll: (params) => 
    api.get('/orders', params),
  
  getById: (id) => 
    api.get(`/orders/${id}`),
  
  create: (data) => 
    api.post('/orders', data),
  
  update: (id, data) => 
    api.put(`/orders/${id}`, data),
  
  confirm: (id) => 
    api.patch(`/orders/${id}/confirm`),
  
  prepare: (id) => 
    api.patch(`/orders/${id}/prepare`),
  
  ready: (id) => 
    api.patch(`/orders/${id}/ready`),
  
  deliver: (id) => 
    api.patch(`/orders/${id}/deliver`),
  
  complete: (id, paymentMethod) => 
    api.patch(`/orders/${id}/complete`, { paymentMethod }),
  
  cancel: (id, reason) => 
    api.patch(`/orders/${id}/cancel`, { reason }),
  
  getByClient: (clientId) => 
    api.get('/orders', { client: clientId }),
  
  getByStatus: (status) => 
    api.get('/orders', { status })
};

// ============================================
// INVOICES API
// ============================================
export const invoicesAPI = {
  getAll: (params) => 
    api.get('/invoices', params),
  
  getById: (id) => 
    api.get(`/invoices/${id}`),
  
  create: (data) => 
    api.post('/invoices', data),
  
  createFromOrder: (orderId) => 
    api.post('/invoices/from-order', { orderId }),
  
  update: (id, data) => 
    api.put(`/invoices/${id}`, data),
  
  cancel: (id) => 
    api.patch(`/invoices/${id}/cancel`),
  
  recordPayment: (id, paymentData) => 
    api.post(`/invoices/${id}/payments`, paymentData),
  
  send: (id, email) => 
    api.post(`/invoices/${id}/send`, { email }),
  
  getOverdue: () => 
    api.get('/invoices', { status: 'OVERDUE' }),
  
  getByClient: (clientId) => 
    api.get('/invoices', { client: clientId })
};

// ============================================
// PAYMENTS API
// ============================================
export const paymentsAPI = {
  getAll: (params) => 
    api.get('/payments', params),
  
  getById: (id) => 
    api.get(`/payments/${id}`),
  
  create: (data) => 
    api.post('/payments', data),
  
  validateCheck: (id, bankData) => 
    api.patch(`/payments/${id}/validate-check`, bankData),
  
  rejectCheck: (id, reason) => 
    api.patch(`/payments/${id}/reject-check`, { reason }),
  
  cancel: (id, reason) => 
    api.patch(`/payments/${id}/cancel`, { reason }),
  
  getStats: (params) => 
    api.get('/payments/stats/summary', params),
  
  getPendingChecks: () => 
    api.get('/payments', { method: 'CHECK', status: 'PENDING' })
};

// ============================================
// DASHBOARD API
// ============================================
export const dashboardAPI = {
  getKPIs: () => 
    api.get('/dashboard/kpis'),
  
  getDailySales: (startDate, endDate) => 
    api.get('/dashboard/daily-sales', { startDate, endDate }),
  
  getTopProducts: (limit) => 
    api.get('/dashboard/top-products', { limit }),
  
  getRecentOrders: (limit) => 
    api.get('/dashboard/recent-orders', { limit }),
  
  getSummary: () => 
    api.get('/dashboard/summary')
};

// ============================================
// REPORTS API
// ============================================
export const reportsAPI = {
  getSalesReport: (startDate, endDate, groupBy) => 
    api.get('/reports/sales', { startDate, endDate, groupBy }),
  
  getProductsReport: (params) => 
    api.get('/reports/products', params),
  
  getClientsReport: () => 
    api.get('/reports/clients'),
  
  getPaymentsReport: (startDate, endDate) => 
    api.get('/reports/payments', { startDate, endDate }),
  
  getStockReport: (category) => 
    api.get('/reports/stock', { category })
};

// ============================================
// AUDIT API (Admin only)
// ============================================
export const auditAPI = {
  getLogs: (params) => 
    api.get('/audit', params),
  
  getStats: () => 
    api.get('/audit/stats'),
  
  getSecurityEvents: () => 
    api.get('/audit/security-events'),
  
  getUserActivity: (userId) => 
    api.get(`/audit/users/${userId}`)
};

// ============================================
// Export default API client
// ============================================
export { TokenManager };
export default api;
