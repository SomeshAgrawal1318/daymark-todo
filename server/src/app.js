import cors from 'cors';
import express from 'express';
import { requireClientId } from './middleware/clientId.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { taskRouter } from './routes/tasks.js';

export function createApp({ clientOrigin = 'http://localhost:5173' } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: clientOrigin, allowedHeaders: ['Content-Type', 'X-Client-ID'] }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/tasks', requireClientId, taskRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
