
const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

async function request(method, endpoint, data = null, token = null) {
  const headers = {};

  if (data !== null && method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data !== null && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let response;

  try {
    response = await fetch(url, config);
  } catch (error) {
    throw new Error(
      `Cannot connect to the backend. Check API URL: ${API_URL}`
    );
  }

  const contentType = response.headers.get('content-type') || '';

  let result;

  if (contentType.includes('application/json')) {
    result = await response.json();
  } else {
    const text = await response.text();
    result = { message: text || 'Server returned an invalid response.' };
  }

  if (!response.ok) {
    throw new Error(
      result?.message || `Request failed with status ${response.status}`
    );
  }

  return result;
}

async function upload(endpoint, formData, token = null) {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch (error) {
    throw new Error('Cannot connect to the backend while uploading.');
  }

  const contentType = response.headers.get('content-type') || '';

  const result = contentType.includes('application/json')
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    throw new Error(
      result?.message || `Upload failed with status ${response.status}`
    );
  }

  return result;
}

export const api = {
  get: (endpoint, token) => request('GET', endpoint, null, token),
  post: (endpoint, data, token) => request('POST', endpoint, data, token),
  put: (endpoint, data, token) => request('PUT', endpoint, data, token),
  patch: (endpoint, data, token) => request('PATCH', endpoint, data, token),
  delete: (endpoint, token) => request('DELETE', endpoint, null, token),
  upload: (endpoint, formData, token) => upload(endpoint, formData, token),
};

export default api;
