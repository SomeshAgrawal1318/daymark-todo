import { describe, expect, it } from 'vitest';
import { getConfig } from '../src/config.js';

describe('getConfig', () => {
  it('parses valid configuration', () => {
    expect(getConfig({ MONGODB_URI: 'mongodb://localhost/daymark', PORT: '4321' })).toEqual({
      mongoUri: 'mongodb://localhost/daymark',
      port: 4321,
      clientOrigin: 'http://localhost:5173',
    });
  });

  it('requires a MongoDB URI', () => {
    expect(() => getConfig({})).toThrow(/MONGODB_URI is required/);
  });

  it('rejects invalid ports', () => {
    expect(() => getConfig({ MONGODB_URI: 'mongodb://localhost/daymark', PORT: 'zero' })).toThrow(/PORT/);
  });
});
