import { describe, expect, it } from 'vitest';
import { Task } from '../src/models/task.js';

const ownerId = '18d75e6c-b731-4a89-8c9e-80b0f6ff6873';

describe('Task model', () => {
  it('applies defaults and trims content', async () => {
    const task = new Task({ ownerId, title: '  Plan API  ', note: '  First pass  ' });
    await task.validate();
    expect(task.title).toBe('Plan API');
    expect(task.note).toBe('First pass');
    expect(task.priority).toBe('medium');
    expect(task.completed).toBe(false);
    expect(task.completedAt).toBeNull();
  });

  it.each([
    [{ ownerId, title: ' ' }, 'title'],
    [{ ownerId, title: 'x'.repeat(121) }, 'title'],
    [{ ownerId, title: 'Task', note: 'x'.repeat(501) }, 'note'],
    [{ ownerId, title: 'Task', priority: 'urgent' }, 'priority'],
    [{ ownerId, title: 'Task', dueDate: '2026-02-30' }, 'dueDate'],
    [{ ownerId: 'not-a-uuid', title: 'Task' }, 'ownerId'],
  ])('rejects invalid input for %s', async (input, field) => {
    const task = new Task(input);
    await expect(task.validate()).rejects.toMatchObject({ errors: { [field]: expect.anything() } });
  });

  it('tracks completion time and clears it when reopened', async () => {
    const task = new Task({ ownerId, title: 'Task' });
    task.completed = true;
    await task.validate();
    expect(task.completedAt).toBeInstanceOf(Date);
    task.completed = false;
    await task.validate();
    expect(task.completedAt).toBeNull();
  });

  it('serializes public fields without owner or mongoose internals', () => {
    const task = new Task({ ownerId, title: 'Task' });
    const output = task.toJSON();
    expect(output.id).toBe(task._id.toString());
    expect(output).not.toHaveProperty('_id');
    expect(output).not.toHaveProperty('__v');
    expect(output).not.toHaveProperty('ownerId');
  });
});
