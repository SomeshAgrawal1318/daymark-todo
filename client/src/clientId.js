export const CLIENT_ID_KEY = 'daymark-client-id';
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getClientId(storage = globalThis.localStorage, cryptoApi = globalThis.crypto) {
  const saved = storage.getItem(CLIENT_ID_KEY)?.trim();
  if (saved && UUID_PATTERN.test(saved)) return saved.toLowerCase();

  if (!cryptoApi?.randomUUID) {
    throw new Error('This browser cannot create an anonymous Daymark identifier.');
  }

  const clientId = cryptoApi.randomUUID().toLowerCase();
  storage.setItem(CLIENT_ID_KEY, clientId);
  return clientId;
}
