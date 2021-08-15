import { subjects, searchCourses } from '../../data/courses';

const searchResolver = {
  Query: {
    search: () => ({}),
  },
  SearchTable: {
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
  },
  Course: {
    subject: ({ subject }) => ({
      name: subject,
      courses: subjects[subject],
    }),
  },
};

export default searchResolver;
