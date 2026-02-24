const API_BASE = {
    containers: '/api/containers',
    products: '/api/products',
};

async function request(url, options = {}) {
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    if (!res.ok && res.status !== 204) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    if (res.status === 204) return null;
    return res.json();
}

// ===== Container API =====
export const containerApi = {
    list: (page = 0, size = 10, filters = {}) => {
        const params = new URLSearchParams({ page, size });
        if (filters.containerId) params.set('containerId', filters.containerId);
        if (filters.containerName) params.set('containerName', filters.containerName);
        return request(`${API_BASE.containers}?${params}`);
    },
    getById: (id) => request(`${API_BASE.containers}/${id}`),
    getByProductId: (productId) => request(`${API_BASE.containers}/by-product/${productId}`),
    create: (data) => request(API_BASE.containers, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`${API_BASE.containers}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`${API_BASE.containers}/${id}`, { method: 'DELETE' }),
};

// ===== Product API =====
export const productApi = {
    list: (page = 0, size = 10, filters = {}) => {
        const params = new URLSearchParams({ page, size });
        if (filters.productId) params.set('productId', filters.productId);
        if (filters.productName) params.set('productName', filters.productName);
        return request(`${API_BASE.products}?${params}`);
    },
    getById: (id) => request(`${API_BASE.products}/${id}`),
    create: (data) => request(API_BASE.products, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`${API_BASE.products}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`${API_BASE.products}/${id}`, { method: 'DELETE' }),
};
