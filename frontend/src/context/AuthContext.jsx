import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const PHONE_REGEX = /^[1-9]\d{9}$/;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load auth state from LocalStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('kee_auth_user');
    const savedToken = localStorage.getItem('kee_auth_token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      try {
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('dismissed_ad_')) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (err) {}

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Login failed');
      }

      const res = await response.json();
      setUser(res.user);
      setToken(res.accessToken);
      localStorage.setItem('kee_auth_user', JSON.stringify(res.user));
      localStorage.setItem('kee_auth_token', res.accessToken);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kee_auth_user');
    localStorage.removeItem('kee_auth_token');
  };

  // HTTP request helper
  const request = async (url, method = 'GET', body = null, isMultipart = false) => {
    const headers = {};
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
    };

    if (body) {
      config.body = isMultipart ? body : JSON.stringify(body);
    }

    const response = await fetch(url, config);

    if (response.status === 401) {
      logout();
      throw new Error('Your session has expired. Please login again.');
    }

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Operation failed');
    }

    return response.json();
  };

  // Unified API Methods, backed entirely by the live NestJS backend
  const api = {
    changePassword: async (oldPassword, newPassword) => {
      return request('/api/auth/change-password', 'POST', { oldPassword, newPassword });
    },

    resetPasswordPublic: async (identifier, method, newPassword) => {
      const response = await fetch('/api/auth/reset-password-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, method, newPassword })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Password reset failed');
      }
      return response.json();
    },

    sendOtp: async (identifier, method, purpose) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (method === 'email' && !emailRegex.test(identifier)) {
        throw new Error('Invalid email address format');
      }
      if (method === 'phone' && !PHONE_REGEX.test(identifier)) {
        throw new Error('Phone number must be exactly 10 digits and cannot start with 0');
      }

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, method, purpose })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to send OTP code');
      }
      return response.json();
    },

    verifyOtp: async (identifier, method, purpose, code) => {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, method, purpose, code })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'OTP verification failed');
      }
      return response.json();
    },

    registerShop: async (dto) => {
      const response = await fetch('/api/auth/register-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Self-registration failed');
      }
      return response.json();
    },

    // Public landing-page shop search (no auth) - used by the "Find a Shop" search page.
    searchPublicShops: async (query = '') => {
      const url = `/api/public/shops${query ? `?query=${encodeURIComponent(query)}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Shop search failed');
      }
      return response.json();
    },

    // --- SUPER ADMIN: SHOPS ---
    getShops: async () => request('/api/super/shops'),
    createShop: async (dto) => request('/api/super/shops', 'POST', dto),
    updateShop: async (id, dto) => request(`/api/super/shops/${id}`, 'PUT', dto),
    suspendShop: async (id, isActive) => request(`/api/super/shops/${id}/suspend`, 'POST', { isActive }),
    resetAdminPassword: async (shopId, newPassword) => request(`/api/super/shops/${shopId}/reset-password`, 'POST', { newPassword }),
    updateSubscription: async (shopId, dto) => request(`/api/super/subscriptions/${shopId}`, 'POST', dto),

    // --- MASTER KEYS (shop-scoped for Shop Admin, all-shops for Super Admin) ---
    getMasterKeys: async (search = '') => {
      const url = user.role === 'SUPER_ADMIN'
        ? `/api/super/keys?search=${search}`
        : `/api/shop/keys/search?query=${search}`;
      return request(url);
    },

    // Super Admin: create a global catalog key (not tied to a shop)
    createMasterKey: async (dto) => request('/api/super/keys', 'POST', dto),

    // Shop Admin: create/reuse a key scoped to their own shop (used during customer registration)
    createShopKey: async (dto) => request('/api/shop/keys', 'POST', dto),

    updateMasterKey: async (id, dto) => request(`/api/super/keys/${id}`, 'PUT', dto),
    deleteMasterKey: async (id) => request(`/api/super/keys/${id}`, 'DELETE'),

    // --- SHOP ADMIN: CUSTOMERS ---
    getCustomers: async (search = '') => request(`/api/shop/customers?search=${search}`),
    getGlobalCustomersForSearch: async (search = '') => request(`/api/shop/customers/global-search?search=${search}`),
    getCustomerById: async (id) => request(`/api/shop/customers/${id}`),
    createCustomer: async (dto) => request('/api/shop/customers', 'POST', dto),
    updateCustomer: async (id, dto) => request(`/api/shop/customers/${id}`, 'PUT', dto),

    uploadDocument: async (customerId, documentType, file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      return request(`/api/shop/customers/${customerId}/docs`, 'POST', formData, true);
    },

    deleteCustomerDocument: async (customerId, documentId) => {
      return request(`/api/shop/customers/${customerId}/docs/${documentId}`, 'DELETE');
    },

    // --- SHOP SETTINGS: VERIFICATION DOCUMENTS ---
    // Backed by the ShopDocument table (see ShopService.addOrReplaceShopDocument /
    // deleteShopDocument). documentType is one of SHOP_PHOTO / SHOP_LICENSE / OWNER_AADHAAR.
    uploadSettingsDocument: async (documentType, file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      return request('/api/shop/settings/documents', 'POST', formData, true);
    },

    // id is the ShopDocument row id (not a fileKey).
    deleteSettingsDocument: async (id) => {
      return request(`/api/shop/settings/documents/${id}`, 'DELETE');
    },

    // --- VISUAL ADS ---
    getAdvertisements: async () => {
      const url = user.role === 'SUPER_ADMIN' ? '/api/super/advertisements' : '/api/shop/advertisements';
      return request(url);
    },

    createAdvertisement: async (dto) => request('/api/super/advertisements', 'POST', dto),
    updateAdvertisement: async (id, dto) => request(`/api/super/advertisements/${id}`, 'PUT', dto),
    deleteAdvertisement: async (id) => request(`/api/super/advertisements/${id}`, 'DELETE'),

    // --- NOTIFICATIONS ---
    getNotifications: async () => request('/api/shop/notifications'),
    markNotificationRead: async (id) => request(`/api/shop/notifications/${id}`, 'PUT'),
    getSuperNotifications: async () => request('/api/super/notifications'),
    markSuperNotificationRead: async (id) => request(`/api/super/notifications/${id}`, 'PUT'),

    // --- REVENUE ---
    getRevenue: async () => request('/api/super/revenue'),
    logRevenue: async (month, year, amount, notes) => request('/api/super/revenue', 'POST', { month, year, amount, notes }),

    // --- SETTINGS ---
    getSettings: async () => request('/api/shop/settings'),
    updateSettings: async (dto) => request('/api/shop/settings', 'PUT', dto),

    // --- PRODUCTS ---
    getProducts: async () => {
      const url = user.role === 'SUPER_ADMIN' ? '/api/super/products' : '/api/shop/products';
      return request(url);
    },
    createProduct: async (dto) => request('/api/super/products', 'POST', dto),
    updateProduct: async (id, dto) => request(`/api/super/products/${id}`, 'PUT', dto),
    deleteProduct: async (id) => request(`/api/super/products/${id}`, 'DELETE'),

    // --- CROSS-SHOP PROMOTIONS (advertisements & promotional products, visible to every shop) ---
    // GET is a shared feed: every shop admin and the super admin see every shop's listings.
    getPromotions: async (includeExpiredOffers = false) =>
      request(`/api/promotions${includeExpiredOffers ? '?includeExpiredOffers=true' : ''}`),
    createPromotion: async (dto) => request('/api/shop/promotions', 'POST', dto),
    updatePromotion: async (id, dto) => {
      const url = user.role === 'SUPER_ADMIN' ? `/api/super/promotions/${id}` : `/api/shop/promotions/${id}`;
      return request(url, 'PUT', dto);
    },
    deletePromotion: async (id) => {
      const url = user.role === 'SUPER_ADMIN' ? `/api/super/promotions/${id}` : `/api/shop/promotions/${id}`;
      return request(url, 'DELETE');
    },

    // --- SUPER CUSTOMERS ---
    getSuperCustomers: async (search = '') => request(`/api/super/customers?search=${search}`),
    getSuperCustomerById: async (id) => request(`/api/super/customers/${id}`),
    updateSuperCustomer: async (id, dto) => request(`/api/super/customers/${id}`, 'PUT', dto),

    getPlanPrices: async () => {
      try {
        const local = localStorage.getItem('kee_plan_prices');
        if (local) return JSON.parse(local);
      } catch (e) {}
      return { MONTHLY: 49, HALF_YEARLY: 269, YEARLY: 499 };
    },

    updatePlanPrices: async (prices) => {
      localStorage.setItem('kee_plan_prices', JSON.stringify(prices));
      return prices;
    },

    // --- DASHBOARDS & REPORTS ---
    getDashboard: async () => {
      const url = user.role === 'SUPER_ADMIN' ? '/api/super/dashboard' : '/api/shop/dashboard';
      return request(url);
    },

    getSupportConfig: async () => request('/api/support-config'),
    updateSupportConfig: async (dto) => request('/api/super/support-config', 'POST', dto),

    getReports: async (startDate, endDate) => {
      let url = `/api/shop/reports`;
      if (startDate || endDate) {
        url += `?startDate=${startDate || ''}&endDate=${endDate || ''}`;
      }
      return request(url);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
};
