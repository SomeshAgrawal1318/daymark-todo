import { RequestValidationError } from '../errors.js';
import { isDateOnly, PRIORITIES } from '../models/task.js';

const CREATE_FIELDS = new Set(['title', 'note', 'priority', 'dueDate']);
const UPDATE_FIELDS = new Set(['title', 'note', 'priority', 'dueDate', 'completed']);

function rejectUnknownFields(body, allowed) {
  const unknown = Object.keys(body).filter((field) => !allowed.has(field));
  if (unknown.length) {
    throw new RequestValidationError('The request includes unsupported fields.', {
      body: `Unsupported field${unknown.length === 1 ? '' : 's'}: ${unknown.join(', ')}.`,
    });
  }
}

function validateTitle(value, required) {
  if (value === undefined && !required) return undefined;
  if (typeof value !== 'string' || !value.trim()) return 'Title is required.';
  if (value.trim().length > 120) return 'Title must be 120 characters or fewer.';
  return undefined;
}

function validateNote(value) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return 'Note must be text.';
  if (value.trim().length > 500) return 'Note must be 500 characters or fewer.';
  return undefined;
}

function validatePriority(value) {
  if (value === undefined) return undefined;
  if (!PRIORITIES.includes(value)) return 'Priority must be low, medium, or high.';
  return undefined;
}

function validateDueDate(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !isDateOnly(value)) return 'Due date must use YYYY-MM-DD.';
  return undefined;
}

function normalize(body) {
  const output = {};
  if ('title' in body) output.title = body.title.trim();
  if ('note' in body) output.note = body.note.trim();
  if ('priority' in body) output.priority = body.priority;
  if ('dueDate' in body) output.dueDate = body.dueDate || null;
  if ('completed' in body) output.completed = body.completed;
  return output;
}

function validate(body, allowed, requireTitle) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new RequestValidationError('Request body must be a JSON object.', { body: 'Invalid request body.' });
  }

  rejectUnknownFields(body, allowed);
  const fields = {};
  const checks = {
    title: validateTitle(body.title, requireTitle),
    note: validateNote(body.note),
    priority: validatePriority(body.priority),
    dueDate: validateDueDate(body.dueDate),
  };
  for (const [field, message] of Object.entries(checks)) if (message) fields[field] = message;
  if ('completed' in body && typeof body.completed !== 'boolean') fields.completed = 'Completed must be true or false.';
  if (Object.keys(fields).length) throw new RequestValidationError('Please correct the highlighted fields.', fields);
  return normalize(body);
}

export function parseCreateTask(body) {
  return validate(body, CREATE_FIELDS, true);
}

export function parseTaskUpdate(body) {
  if (body && typeof body === 'object' && !Array.isArray(body) && Object.keys(body).length === 0) {
    throw new RequestValidationError('Provide at least one field to update.', { body: 'No changes were provided.' });
  }
  return validate(body, UPDATE_FIELDS, false);
}
