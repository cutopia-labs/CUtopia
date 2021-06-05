const { getTimetable, addTimetable, removeTimetable } = require('dynamodb');

exports.User = {
  timetable: async (parent, args, { user }) => {
    const { username } = user;
    return await getTimetable({ username });
  },
};

exports.Mutation = {
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
};

exports.CourseTableEntry = {
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
};
