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
      return await getTimetablesOverview({
        username,
        shared: false,
      });
    },
    sharedTimetables: async (parent, args, { user }) => {
      const { username } = user;
      return await getTimetablesOverview({
        username,
        shared: true,
      });
    },
  },
  Query: {
    timetable: async (parent, { id }, { user }) => {
      const { username } = user;
      return await getTimetable({ id, username });
    },
  },
  Mutation: {
    uploadTimetable: async (parent, { input }, { user }) => {
      const { username } = user;
      const { entries, tableName, expire } = input;
      return await uploadTimetable({ username, entries, tableName, expire });
    },
    removeTimetable: async (parent, { id }, { user }) => {
      const { username } = user;
      await removeTimetable({ username, id });
    },
  },
  CourseTableEntry: {
    sections: ({ sections }) => {
      return sections.map(section => {
        const { name } = section;
        return {
          ...section,
          idsContext: {
            section: name,
          },
        };
      });
    },
  },
};

export default timetableResolver;
