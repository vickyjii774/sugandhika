const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request(method, endpoint, data = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    throw error;
  }
}

async function upload(endpoint, formData, token = null) {
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Upload failed! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    throw error;
  }
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
