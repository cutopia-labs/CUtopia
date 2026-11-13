import mongoose from 'mongoose';

export * from './controllers';

require('dotenv').config();

let pendingConnection: Promise<typeof mongoose>;

export const connect = async (uri: string) => {
  if (pendingConnection) {
    await pendingConnection;
    return;
  }
  if (mongoose.connection.readyState === mongoose.STATES.connected) return;
  pendingConnection = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      maxPoolSize: 5,
      minPoolSize: 0,
      bufferCommands: false,
    })
    .catch(() => {
      throw new Error('Database connection unavailable');
    });
  try {
    await pendingConnection;
  } finally {
    pendingConnection = undefined;
  }
};

export const disconnect = async () => {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};
