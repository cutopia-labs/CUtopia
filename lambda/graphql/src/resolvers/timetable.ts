import {
  uploadTimetable,
  removeTimetable,
  getTimetable,
  getTimetablesOverview,
} from 'mongodb';
import { Resolvers } from '../schemas/types';

const timetableResolver: Resolvers = {
  User: {
    timetables: async (parent, args, { user }) => {
      const { username } = user;
      return await getTimetablesOverview({ username });
    },
  },
  Query: {
    timetable: async (parent, { _id }, { user }) => {
      const { username } = user;
      return await getTimetable({ _id, username });
    },
  },
  Mutation: {
    uploadTimetable: async (parent, { input }, { user }) => {
      const { username } = user;
      const { entries, tableName, expire } = input;
      return await uploadTimetable({ username, entries, tableName, expire });
    },
    removeTimetable: async (parent, { input }, { user }) => {
      const { username } = user;
      const { _id, expire } = input;
      await removeTimetable({ username, _id, expire });
    },
  },
};

export default timetableResolver;
