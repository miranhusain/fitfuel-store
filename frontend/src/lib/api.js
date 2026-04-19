const BASE = '/api';
const TOKEN_KEY = 'ff_admin_token';

export const session = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (t) => sessionStorage.setItem(TOKEN_KEY, t),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
  isAdmin: () => !!sessionStorage.getItem(TOKEN_KEY),
};

async function req(path, options = {}, auth = false) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers ?? {}) };
  if (auth) { const t = session.get(); if (t) headers['x-admin-token'] = t; }
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export async function login(password) {
  const { token } = await req('/auth/login', { method: 'POST', body: JSON.stringify({ password }) });
  session.set(token);
}
export async function logout() {
  await req('/auth/logout', { method: 'POST' }, true).catch(() => {});
  session.clear();
}

// ─── Products ──────────────────────────────────────────────────────────────
export async function fetchProducts(params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([,v]) => v !== '' && v !== undefined)).toString();
  return req(`/products${qs ? '?' + qs : ''}`);
}
export async function fetchProduct(id)    { return req(`/products/${id}`); }
export async function fetchMeta()         { return req('/products/meta'); }
export async function createProduct(data) { return req('/products', { method: 'POST', body: JSON.stringify(data) }, true); }
export async function updateProduct(id, data) { return req(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true); }
export async function deleteProduct(id)   { return req(`/products/${id}`, { method: 'DELETE' }, true); }

// ─── Analytics ────────────────────────────────────────────────────────────
export function trackEvent(type, productId) {
  fetch(`${BASE}/analytics/event`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, productId }),
  }).catch(() => {});
}
export async function fetchStats()    { return req('/analytics/stats', {}, true); }
export async function fetchLogs()     { return req('/analytics/logs', {}, true); }
export async function fetchSystem()   { return req('/analytics/system', {}, true); }
export async function fetchSettings() { return req('/analytics/settings', {}, true); }
export async function saveSettings(data) { return req('/analytics/settings', { method: 'PUT', body: JSON.stringify(data) }, true); }
