import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CLIENT_ID_KEY, getClientId } from './clientId.js';

const generated = '18d75e6c-b731-4a89-8c9e-80b0f6ff6873';

describe('getClientId', () => {
  beforeEach(() => localStorage.clear());

  it('generates and persists an ID on first use', () => {
    const cryptoApi = { randomUUID: vi.fn(() => generated) };
    expect(getClientId(localStorage, cryptoApi)).toBe(generated);
    expect(localStorage.getItem(CLIENT_ID_KEY)).toBe(generated);
  });

  it('reuses a valid stored ID', () => {
    localStorage.setItem(CLIENT_ID_KEY, generated.toUpperCase());
    const cryptoApi = { randomUUID: vi.fn() };
    expect(getClientId(localStorage, cryptoApi)).toBe(generated);
    expect(cryptoApi.randomUUID).not.toHaveBeenCalled();
  });

  it('replaces malformed stored data', () => {
    localStorage.setItem(CLIENT_ID_KEY, 'broken');
    expect(getClientId(localStorage, { randomUUID: () => generated })).toBe(generated);
  });
});
