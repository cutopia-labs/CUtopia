import {
  getTimetable,
  addTimetable,
  removeTimetable,
  deleteSharedTimetable,
} from 'dynamodb';
import { uploadTimetable, getSharedTimetable } from 'mongodb';

const timetableResolver = {
  User: {
    timetable: async (parent, args, { user }) => {
      const { username } = user;
      return await getTimetable({ username });
    },
  },
  Query: {
    timetable: async (parent, { id }) => {
      return await getSharedTimetable({ id });
    },
  },
  Mutation: {
    addTimetable: async (parent, { input }, { user }) => {
      const { username } = user;
      const { entries } = input;
      return await addTimetable({ username, entries });
    },
    removeTimetable: async (parent, { input }, { user }) => {
      const { username } = user;
      const { indices } = input;
      return await removeTimetable({ username, indices });
    },
    uploadTimetable: async (parent, { input }, { user }) => {
      const { username } = user;
      const { entries, tableName, expire } = input;
      return await uploadTimetable({ username, entries, tableName, expire });
    },
    deleteSharedTimetable: async (parent, { id }, { user }) => {
      const { username } = user;
      await deleteSharedTimetable({ username, id });
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
