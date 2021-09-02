import {
  uploadTimetable,
  removeTimetable,
  getTimetable,
  getTimetablesOverview,
} from 'mongodb';

const timetableResolver = {
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
    removeTimetable: async (parent, { _id }, { user }) => {
      const { username } = user;
      await removeTimetable({ username, _id });
    },
  },
};

export default timetableResolver;
