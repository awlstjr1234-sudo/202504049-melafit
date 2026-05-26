const getApiBase = () => {
  if (typeof window === 'undefined') return 'https://meal-fit-backend.onrender.com/api';
  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://${hostname}:5000/api`;
  }
  return 'https://meal-fit-backend.onrender.com/api';
};

export const getApiUrl = () => getApiBase();

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  const t = localStorage.getItem('mealfit_token');
  return (!t || t === 'null' || t === 'undefined') ? null : t;
};
export const setToken = (t) => localStorage.setItem('mealfit_token', t);
export const clearAuth = () => {
  localStorage.removeItem('mealfit_token');
  localStorage.removeItem('mealfit_user');
};
export const getUser = () => {
  try {
    const r = localStorage.getItem('mealfit_user');
    return r ? JSON.parse(r) : null;
  } catch { return null; }
};
export const setUser = (u) => localStorage.setItem('mealfit_user', JSON.stringify(u));

export async function apiCall(path, options = {}) {
  const API = getApiBase();
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API 오류');
  return data;
}
