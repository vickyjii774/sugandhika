const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

async function request(method, endpoint, data = null, token = null) {
  const headers = {};

  if (token) headers.Authorization = `Bearer ${token}`;

  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  if (data !== null && method !== 'GET' && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config = { method, headers };

  if (data !== null && method !== 'GET') {
    config.body = isFormData ? data : JSON.stringify(data);
  }

  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  let response;

  try {
    response = await fetch(url, config);
  } catch {
    throw new Error(`Cannot connect to the backend. Check API URL: ${API_URL}`);
  }

  const contentType = response.headers.get('content-type') || '';
  let result;

  if (contentType.includes('application/json')) {
    result = await response.json();
  } else {
    const bodyText = await response.text();
    result = { message: bodyText || 'Server returned an invalid response.' };
  }

  if (!response.ok) {
    throw new Error(result?.message || `Request failed with status ${response.status}`);
  }

  return result;
}

export const api = {
  get: (endpoint, token) => request('GET', endpoint, null, token),
  post: (endpoint, data, token) => request('POST', endpoint, data, token),
  put: (endpoint, data, token) => request('PUT', endpoint, data, token),
  patch: (endpoint, data, token) => request('PATCH', endpoint, data, token),
  delete: (endpoint, token) => request('DELETE', endpoint, null, token),
  upload: (endpoint, formData, token) => request('POST', endpoint, formData, token),
  uploadPut: (endpoint, formData, token) => request('PUT', endpoint, formData, token),
};

export default api;
