import mongoose from 'mongoose';

export * from './controllers';

require('dotenv').config();

export const connect = async uri => {
  if (mongoose.connection.readyState === mongoose.STATES.disconnected) {
    console.log(`Try connecting to ${uri}`);
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully');
  }
};

export const disconnect = async () => {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};
