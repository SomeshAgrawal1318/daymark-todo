import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { Task } from '../src/models/task.js';

const clientA = '18d75e6c-b731-4a89-8c9e-80b0f6ff6873';
const clientB = 'd87fd0e2-e1d0-4f70-80d9-2aa167cc426d';
const app = createApp();
let mongo;

const api = (method, path, clientId = clientA) => request(app)[method](path).set('X-Client-ID', clientId);

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await Task.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('health and anonymous context', () => {
  it('returns application health without a client ID', async () => {
    await request(app).get('/api/health').expect(200, { status: 'ok' });
  });

  it.each([undefined, 'not-a-uuid'])('rejects missing or invalid client ID %s', async (clientId) => {
    const call = request(app).get('/api/tasks');
    if (clientId) call.set('X-Client-ID', clientId);
    const response = await call.expect(400);
    expect(response.body.error.code).toBe('invalid_client_id');
  });
});

describe('task CRUD', () => {
  it('creates, lists, and persists a normalized task', async () => {
    const created = await api('post', '/api/tasks').send({
      title: '  Finalize API  ', note: '  Confirm shapes  ', priority: 'high', dueDate: '2026-09-20',
    }).expect(201);
    expect(created.body.task).toMatchObject({
      title: 'Finalize API', note: 'Confirm shapes', priority: 'high', dueDate: '2026-09-20', completed: false,
    });
    expect(created.body.task).not.toHaveProperty('ownerId');

    const listed = await api('get', '/api/tasks').expect(200);
    expect(listed.body.tasks).toHaveLength(1);
    expect(listed.body.tasks[0].id).toBe(created.body.task.id);
  });

  it.each([
    [{}, 'title'],
    [{ title: ' ' }, 'title'],
    [{ title: 'Task', note: 'x'.repeat(501) }, 'note'],
    [{ title: 'Task', priority: 'urgent' }, 'priority'],
    [{ title: 'Task', dueDate: 'tomorrow' }, 'dueDate'],
    [{ title: 'Task', ownerId: clientB }, 'body'],
  ])('rejects invalid create payload %#', async (body, field) => {
    const response = await api('post', '/api/tasks').send(body).expect(400);
    expect(response.body.error.fields).toHaveProperty(field);
  });

  it('orders active dated tasks first, then undated and completed tasks', async () => {
    const later = await Task.create({ ownerId: clientA, title: 'Later', dueDate: '2026-09-24' });
    const soon = await Task.create({ ownerId: clientA, title: 'Soon', dueDate: '2026-09-21' });
    const undated = await Task.create({ ownerId: clientA, title: 'Undated' });
    const done = await Task.create({ ownerId: clientA, title: 'Done', completed: true });
    const response = await api('get', '/api/tasks').expect(200);
    expect(response.body.tasks.map((task) => task.id)).toEqual([
      soon.id, later.id, undated.id, done.id,
    ].map(String));
  });

  it('edits, completes, and reopens a task', async () => {
    const task = await Task.create({ ownerId: clientA, title: 'Draft' });
    const edited = await api('patch', `/api/tasks/${task.id}`).send({ title: 'Final', completed: true }).expect(200);
    expect(edited.body.task.title).toBe('Final');
    expect(edited.body.task.completed).toBe(true);
    expect(edited.body.task.completedAt).toBeTruthy();

    const reopened = await api('patch', `/api/tasks/${task.id}`).send({ completed: false }).expect(200);
    expect(reopened.body.task.completed).toBe(false);
    expect(reopened.body.task.completedAt).toBeNull();
  });

  it('rejects empty, unknown, and invalid updates', async () => {
    const task = await Task.create({ ownerId: clientA, title: 'Task' });
    await api('patch', `/api/tasks/${task.id}`).send({}).expect(400);
    await api('patch', `/api/tasks/${task.id}`).send({ ownerId: clientB }).expect(400);
    await api('patch', `/api/tasks/${task.id}`).send({ completed: 'yes' }).expect(400);
    await api('patch', '/api/tasks/not-an-id').send({ title: 'No' }).expect(400);
  });

  it('deletes an owned task and treats repeated deletion as not found', async () => {
    const task = await Task.create({ ownerId: clientA, title: 'Delete me' });
    await api('delete', `/api/tasks/${task.id}`).expect(204);
    await api('delete', `/api/tasks/${task.id}`).expect(404);
    expect(await Task.findById(task.id)).toBeNull();
  });

  it('isolates list, update, and delete operations by client ID', async () => {
    const taskA = await Task.create({ ownerId: clientA, title: 'A only' });
    await Task.create({ ownerId: clientB, title: 'B only' });

    const listA = await api('get', '/api/tasks', clientA).expect(200);
    const listB = await api('get', '/api/tasks', clientB).expect(200);
    expect(listA.body.tasks.map((task) => task.title)).toEqual(['A only']);
    expect(listB.body.tasks.map((task) => task.title)).toEqual(['B only']);

    await api('patch', `/api/tasks/${taskA.id}`, clientB).send({ title: 'Stolen' }).expect(404);
    await api('delete', `/api/tasks/${taskA.id}`, clientB).expect(404);
    expect((await Task.findById(taskA.id)).title).toBe('A only');
  });
});
