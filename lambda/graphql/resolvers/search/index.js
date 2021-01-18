const { searchCourses } = require('../../data/courses');

exports.Query = {
  search: () => ({}),
};

exports.SearchTable = {
  courses: (parent, { input }) => {
    const { text, limit = 10 } = input;
    const courses = searchCourses(text, limit).map(result => ({
      subject: result.subject,
      course: result.course,
      idsContext: {
        subject: result.subject,
      },
    }));
    return courses;
  },
};
