import mongoose from 'mongoose';
import { AppError } from '../errors.js';

function mongooseFields(error) {
  return Object.fromEntries(
    Object.entries(error.errors).map(([field, detail]) => [field, detail.message]),
  );
}

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: { code: 'route_not_found', message: 'Route not found.' } });
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof AppError) {
    const body = { code: error.code, message: error.message };
    if (error.fields) body.fields = error.fields;
    res.status(error.status).json({ error: body });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Please correct the highlighted fields.',
        fields: mongooseFields(error),
      },
    });
    return;
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    res.status(400).json({ error: { code: 'invalid_json', message: 'Request body must contain valid JSON.' } });
    return;
  }

  console.error(error);
  res.status(500).json({ error: { code: 'internal_error', message: 'Something went wrong. Please try again.' } });
}
