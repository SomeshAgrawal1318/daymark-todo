import mongoose from 'mongoose';

let connectionPromise;

export async function connectDatabase(uri) {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  mongoose.set('strictQuery', true);
  if (!connectionPromise || mongoose.connection.readyState === 0) {
    connectionPromise = mongoose.connect(uri).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  await connectionPromise;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  connectionPromise = undefined;
}
