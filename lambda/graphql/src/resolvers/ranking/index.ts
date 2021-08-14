const { calculatePopularCourses, calculateTopRatedCourses, getCourseRating } = require('./impl');

const rankingResolver = {
  Query: {
    ranking: () => ({})
  },
  RankTable: {
    popularCourses: async (parent, { filter }) => {
      const { limit } = filter;
      const popularCourses = await calculatePopularCourses();
      return popularCourses.slice(0, limit);
    },
    topRatedCourses: async (parent, { filter }) => {
      const { limit, sortBy } = filter;
      const courses = await calculateTopRatedCourses('top-rated-courses-by-criterion');
      return courses[sortBy].slice(0, limit);
    },
    topRatedAcademicGroups: async (parent, { filter }) => {
      const { limit, sortBy } = filter;
      const academicGroups = await calculateTopRatedCourses('top-rated-academic-groups-by-criterion');
      return academicGroups[sortBy].slice(0, limit);
    }
  },
  Course: {
    rating: async ({ idsContext, course }) => {
      const courseId = idsContext.subject + course.code;
      const rating = await getCourseRating(courseId);
      return rating;
    }
  }
};

export default rankingResolver;
