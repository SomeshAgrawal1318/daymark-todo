import 'dotenv/config';
import { createApp } from './app.js';
import { getConfig } from './config.js';
import { connectDatabase, disconnectDatabase } from './db.js';

const config = getConfig();
await connectDatabase(config.mongoUri);

const server = createApp({ clientOrigin: config.clientOrigin }).listen(config.port, () => {
  console.log(`Daymark API listening on http://localhost:${config.port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Closing Daymark API.`);
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
