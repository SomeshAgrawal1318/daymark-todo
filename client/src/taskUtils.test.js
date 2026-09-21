import { describe, expect, it } from 'vitest';
import { dueLabel, filterTasks, sortTasks } from './taskUtils.js';

const tasks = [
  { id: 'done', title: 'Done', note: '', completed: true, priority: 'medium', dueDate: null, createdAt: '2026-09-20T12:00:00Z' },
  { id: 'later', title: 'Later', note: 'Write tests', completed: false, priority: 'low', dueDate: '2026-09-23', createdAt: '2026-09-20T12:00:00Z' },
  { id: 'soon', title: 'Soon', note: 'API', completed: false, priority: 'high', dueDate: '2026-09-21', createdAt: '2026-09-20T12:00:00Z' },
];

describe('task utilities', () => {
  it('sorts active due work before completed work', () => {
    expect(sortTasks(tasks).map((task) => task.id)).toEqual(['soon', 'later', 'done']);
  });

  it('combines status filters and case-insensitive search', () => {
    expect(filterTasks(tasks, 'active', 'api').map((task) => task.id)).toEqual(['soon']);
    expect(filterTasks(tasks, 'completed', '').map((task) => task.id)).toEqual(['done']);
  });

  it('labels overdue, today, and tomorrow against a fixed clock', () => {
    const now = new Date(2026, 8, 20, 12);
    expect(dueLabel('2026-09-19', now)).toMatchObject({ text: 'Overdue', tone: 'danger' });
    expect(dueLabel('2026-09-20', now)).toMatchObject({ text: 'Today' });
    expect(dueLabel('2026-09-21', now)).toMatchObject({ text: 'Tomorrow' });
  });
});
