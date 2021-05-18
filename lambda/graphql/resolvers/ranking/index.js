const { getReviews } = require('dynamodb');
const { subjects } = require('../../data/courses');
const NodeCache = require('node-cache');

const rankingCache = new NodeCache({
  stdTTL: 1800,
});

const getCourseById = (courseId) => {
  const subjectName = courseId.slice(0, 4);
  const courseCode = courseId.slice(4, 8);
  const courses = subjects[subjectName];
  return courses.filter(course => course.code === courseCode)[0];
};

const calculatePopularCourses = async () => {
  const reviews = await getReviews({
    getAll: true,
  });
  const popularCourses = {};
  reviews.forEach(review => {
    if (popularCourses[review.courseId] !== undefined) {
      popularCourses[review.courseId]++;
    } else {
      popularCourses[review.courseId] = 1;
    }
  });

  const result = Object.keys(popularCourses)
    .sort((a, b) => popularCourses[b] - popularCourses[a])
    .map(courseId => ({
      courseId,
      course: {
        course: getCourseById(courseId),
      },
      numReviews: popularCourses[courseId],
    }));
  return result;
};

const calculateTopRatedCourses = async () => {
  const reviews = await getReviews({
    getAll: true,
  });
  const topRatedCoursesById = {};
  const topRatedCoursesByCriterion = {
    "overall": [],
    "grading": [],
    "content": [],
    "difficulty": [],
    "teaching": [],
  };
  const criterions = ["grading", "content", "difficulty", "teaching"];

  reviews.forEach(review => {
    const courseRated = topRatedCoursesById[review.courseId];
    if (courseRated) {
      criterions.forEach(criterion => {
        const floatValue = 5 - (review[criterion]["grade"].charCodeAt(0) - 65);
        courseRated[criterion] += floatValue;
        courseRated["overall"] += floatValue;
      });
      courseRated["numReviews"]++;
    } else {
      let overall = 0;
      criterions.forEach(criterion => {
        const floatValue = 5 - (review[criterion]["grade"].charCodeAt(0) - 65);
        overall += floatValue;
        topRatedCoursesById[review.courseId] = {
          ...topRatedCoursesById[review.courseId],
          [criterion]: floatValue,
        };
      });
      topRatedCoursesById[review.courseId]["overall"] = overall;
      topRatedCoursesById[review.courseId]["numReviews"] = 1;
    }
  });

  Object.keys(topRatedCoursesById)
    .map(courseId => {
      const courseRated = topRatedCoursesById[courseId];
      criterions.forEach(criterion =>
        courseRated[criterion] = courseRated[criterion] / courseRated["numReviews"]
      );
      courseRated["overall"] = courseRated["overall"] / (courseRated["numReviews"] * criterions.length);
    });

  [...criterions, "overall"].forEach(criterion =>
    topRatedCoursesByCriterion[criterion] = Object.keys(topRatedCoursesById)
      .sort((a, b) => topRatedCoursesById[b][criterion] - topRatedCoursesById[a][criterion])
      .map(courseId => ({
        courseId,
        course: {
          course: getCourseById(courseId),
        },
        ...topRatedCoursesById[courseId],
      }))
  );
  return topRatedCoursesByCriterion;
};

exports.Query = {
  ranking: () => ({}),
};

exports.RankTable = {
  popularCourses: async (parent, { filter }) => {
    const { limit } = filter;
    const cachedPopularCourses = rankingCache.get('popular-courses');
    if (cachedPopularCourses) {
      return cachedPopularCourses.slice(0, limit);
    }
    const popularCourses = await calculatePopularCourses();
    rankingCache.set('popular-courses', popularCourses);
    return popularCourses.slice(0, limit);
  },
  topRatedCourses: async (parent, { filter }) => {
    const { limit, sortBy } = filter;
    const cachedTopRatedCourses = rankingCache.get('top-rated-courses');
    if (cachedTopRatedCourses) {
      return cachedTopRatedCourses[sortBy].slice(0, limit);
    }
    const topRatedCourses = await calculateTopRatedCourses();
    rankingCache.set('top-rated-courses', topRatedCourses);
    return topRatedCourses[sortBy].slice(0, limit);
  },
};
