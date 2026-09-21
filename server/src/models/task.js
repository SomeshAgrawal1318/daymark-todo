import mongoose from 'mongoose';
import { UUID_PATTERN } from '../middleware/clientId.js';

export const PRIORITIES = ['low', 'medium', 'high'];

export function isDateOnly(value) {
  if (value === null || value === undefined || value === '') return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

const taskSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
      lowercase: true,
      validate: { validator: (value) => UUID_PATTERN.test(value), message: 'Owner ID must be a valid UUID.' },
      index: true,
    },
    title: { type: String, required: [true, 'Title is required.'], trim: true, minlength: 1, maxlength: 120 },
    note: { type: String, trim: true, maxlength: 500, default: '' },
    priority: { type: String, enum: PRIORITIES, default: 'medium' },
    dueDate: {
      type: String,
      default: null,
      validate: { validator: isDateOnly, message: 'Due date must use YYYY-MM-DD.' },
    },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

taskSchema.index({ ownerId: 1, completed: 1, dueDate: 1, createdAt: -1 });

taskSchema.pre('validate', function syncCompletedAt() {
  if (this.isModified('completed')) {
    this.completedAt = this.completed ? this.completedAt || new Date() : null;
  }
});

taskSchema.set('toJSON', {
  transform(_document, value) {
    value.id = value._id.toString();
    delete value._id;
    delete value.__v;
    delete value.ownerId;
    return value;
  },
});

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
