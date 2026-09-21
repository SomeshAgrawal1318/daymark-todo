import { Router } from 'express';
import mongoose from 'mongoose';
import { notFound, RequestValidationError } from '../errors.js';
import { Task } from '../models/task.js';
import { parseCreateTask, parseTaskUpdate } from '../validation/taskPayload.js';

export const taskRouter = Router();

function compareTasks(first, second) {
  if (first.completed !== second.completed) return Number(first.completed) - Number(second.completed);
  if (first.dueDate && second.dueDate && first.dueDate !== second.dueDate) return first.dueDate.localeCompare(second.dueDate);
  if (first.dueDate && !second.dueDate) return -1;
  if (!first.dueDate && second.dueDate) return 1;
  return new Date(second.createdAt) - new Date(first.createdAt);
}

function validTaskId(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw new RequestValidationError('Task ID is invalid.', { id: 'Task ID must be a MongoDB object ID.' });
  }
}

taskRouter.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find({ ownerId: req.ownerId });
    const serialized = tasks.map((task) => task.toJSON()).sort(compareTasks);
    res.json({ tasks: serialized });
  } catch (error) {
    next(error);
  }
});

taskRouter.post('/', async (req, res, next) => {
  try {
    const input = parseCreateTask(req.body);
    const task = await Task.create({ ownerId: req.ownerId, ...input });
    res.status(201).json({ task: task.toJSON() });
  } catch (error) {
    next(error);
  }
});

taskRouter.patch('/:id', async (req, res, next) => {
  try {
    validTaskId(req.params.id);
    const input = parseTaskUpdate(req.body);
    const task = await Task.findOne({ _id: req.params.id, ownerId: req.ownerId });
    if (!task) throw notFound('Task not found.');
    Object.assign(task, input);
    await task.save();
    res.json({ task: task.toJSON() });
  } catch (error) {
    next(error);
  }
});

taskRouter.delete('/:id', async (req, res, next) => {
  try {
    validTaskId(req.params.id);
    const task = await Task.findOneAndDelete({ _id: req.params.id, ownerId: req.ownerId });
    if (!task) throw notFound('Task not found.');
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
