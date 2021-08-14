import { getTimetable, addTimetable, removeTimetable, shareTimetable, getSharedTimetable, deleteSharedTimetable } from 'dynamodb';

const User = {
  timetable: async (parent, args, { user }) => {
    const { username } = user;
    return await getTimetable({ username });
  }
};

const Query = {
  timetable: async (parent, { id }) => {
    return await getSharedTimetable({ id });
  }
};

const Mutation = {
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
  shareTimetable: async (parent, { input }, { user }) => {
    const { username } = user;
    const { entries, tableName, expire } = input;
    return await shareTimetable({ username, entries, tableName, expire });
  },
  deleteSharedTimetable: async (parent, { id }, { user }) => {
    const { username } = user;
    await deleteSharedTimetable({ username, id });
  }
};

const CourseTableEntry = {
  sections: ({ sections }) => {
    return sections.map((section) => {
      const { name } = section;
      return {
        ...section,
        idsContext: {
          section: name
        }
      };
    });
  }
};

const timetableResolver = {
  User,
  Query,
  Mutation,
  CourseTableEntry,
};

export default timetableResolver;
