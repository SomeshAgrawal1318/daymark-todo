import { AppError } from '../errors.js';

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function requireClientId(req, _res, next) {
  const clientId = req.get('X-Client-ID')?.trim();
  if (!clientId || !UUID_PATTERN.test(clientId)) {
    next(new AppError(400, 'invalid_client_id', 'A valid X-Client-ID UUID header is required.'));
    return;
  }

  req.ownerId = clientId.toLowerCase();
  next();
}
