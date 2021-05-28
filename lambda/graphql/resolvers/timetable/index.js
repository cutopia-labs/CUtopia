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
  course_sections: ({ course_sections }) => {
    return course_sections.map(course_section => {
      const { name } = course_section;
      return {
        ...course_section,
        idsContext: {
          section: name,
        },
      };
    });
  },
};
