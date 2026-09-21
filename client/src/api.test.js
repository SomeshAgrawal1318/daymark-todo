import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, taskApi } from './api.js';
import { CLIENT_ID_KEY } from './clientId.js';

const clientId = '18d75e6c-b731-4a89-8c9e-80b0f6ff6873';

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' }, ...init });
}

describe('taskApi', () => {
  beforeEach(() => {
    localStorage.setItem(CLIENT_ID_KEY, clientId);
    vi.stubGlobal('fetch', vi.fn());
  });

  it('adds the anonymous client ID to list requests', async () => {
    fetch.mockResolvedValue(jsonResponse({ tasks: [] }));
    await expect(taskApi.list()).resolves.toEqual([]);
    const [, options] = fetch.mock.calls[0];
    expect(options.headers.get('X-Client-ID')).toBe(clientId);
  });

  it('sends JSON and returns the created task', async () => {
    fetch.mockResolvedValue(jsonResponse({ task: { id: '1', title: 'Task' } }, { status: 201 }));
    await expect(taskApi.create({ title: 'Task' })).resolves.toMatchObject({ title: 'Task' });
    expect(fetch.mock.calls[0][1]).toMatchObject({ method: 'POST', body: JSON.stringify({ title: 'Task' }) });
  });

  it('maps structured server errors', async () => {
    fetch.mockResolvedValue(jsonResponse({ error: { code: 'validation_error', message: 'Fix it', fields: { title: 'Required' } } }, { status: 400 }));
    await expect(taskApi.create({ title: '' })).rejects.toMatchObject({
      name: 'Error', code: 'validation_error', fields: { title: 'Required' }, status: 400,
    });
  });

  it('maps network failures to an actionable error', async () => {
    fetch.mockRejectedValue(new TypeError('offline'));
    await expect(taskApi.list()).rejects.toBeInstanceOf(ApiError);
    await expect(taskApi.list()).rejects.toMatchObject({ code: 'network_error' });
  });
});
