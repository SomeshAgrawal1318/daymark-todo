import { getClientId } from './clientId.js';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(message, { code = 'request_failed', fields, status } = {}) {
    super(message);
    this.code = code;
    this.fields = fields;
    this.status = status;
  }
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  headers.set('X-Client-ID', getClientId());
  if (options.body) headers.set('Content-Type', 'application/json');

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('Daymark could not reach the server. Check your connection and try again.', { code: 'network_error' });
  }

  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const error = data?.error;
    throw new ApiError(error?.message || 'The request could not be completed.', {
      code: error?.code,
      fields: error?.fields,
      status: response.status,
    });
  }

  if (!data) throw new ApiError('The server returned an unexpected response.', { code: 'invalid_response', status: response.status });
  return data;
}

export const taskApi = {
  async list() {
    return (await request('/tasks')).tasks;
  },
  async create(input) {
    return (await request('/tasks', { method: 'POST', body: JSON.stringify(input) })).task;
  },
  async update(id, input) {
    return (await request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(input) })).task;
  },
  async remove(id) {
    await request(`/tasks/${id}`, { method: 'DELETE' });
  },
};
