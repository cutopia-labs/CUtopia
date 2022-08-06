import mongoose from 'mongoose';

export * from './controllers';

require('dotenv').config();

// https://docs.atlas.mongodb.com/best-practices-connecting-from-aws-lambda/#connection-examples
let conn = null;

export const connect = async (uri: string) => {
  if (conn === null) {
    console.log(`Try connecting to ${uri}`);
    conn = mongoose.connect(uri).then(() => mongoose);
    await conn;
    console.log('Connected to MongoDB successfully');
  }
  return conn;
};

export const disconnect = async () => {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};
