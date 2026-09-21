function parsePort(value) {
  const port = Number(value ?? 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }
  return port;
}

export function getConfig(env = process.env) {
  const mongoUri = env.MONGODB_URI?.trim();
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required. Copy .env.example to server/.env and provide a MongoDB connection string.');
  }

  return {
    port: parsePort(env.PORT),
    mongoUri,
    clientOrigin: env.CLIENT_ORIGIN?.trim() || 'http://localhost:5173',
  };
}
