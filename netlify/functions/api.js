import serverless from 'serverless-http';
import { createApp } from '../../server/src/app.js';
import { connectDatabase } from '../../server/src/db.js';

async function ensureDatabaseConnection() {
  const mongoUri = process.env.MONGODB_URI?.trim();
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required for the Daymark API.');
  }

  await connectDatabase(mongoUri);
}

const app = createApp({
  clientOrigin: process.env.DEPLOY_PRIME_URL || process.env.URL || 'http://localhost:8888',
});
const handleRequest = serverless(app);

export async function handler(event, context) {
  await ensureDatabaseConnection();
  return handleRequest(event, context);
}
