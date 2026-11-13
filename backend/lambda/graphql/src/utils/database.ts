import { ApolloError } from 'apollo-server-errors';
import { connect } from 'mongodb';

export const requireDatabase = async () => {
  try {
    await connect(process.env.ATLAS_URI);
  } catch {
    throw new ApolloError(
      'Database temporarily unavailable. Please try again.',
      'DATABASE_UNAVAILABLE'
    );
  }
};
