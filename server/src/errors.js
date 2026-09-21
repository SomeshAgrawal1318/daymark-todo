export class AppError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export class RequestValidationError extends AppError {
  constructor(message, fields) {
    super(400, 'validation_error', message, fields);
  }
}

export function notFound(message = 'The requested resource was not found.') {
  return new AppError(404, 'not_found', message);
}
