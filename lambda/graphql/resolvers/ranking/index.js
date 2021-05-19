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

const getCourseRating = async (courseId) => {
  const cachedTopRatedCourses = rankingCache.get('top-rated-courses');
  if (cachedTopRatedCourses) {
    return cachedTopRatedCourses[courseId];
  }
  const { topRatedCourses } = await calculateTopRatedCourses();
  return topRatedCourses[courseId];
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
  rankingCache.set('popular-courses', result);
  return result;
};

const calculateTopRatedCourses = async () => {
  const reviews = await getReviews({
    getAll: true,
  });
  const topRatedCourses = {}; // lookup table of course rating
  const topRatedAcademicGroups = {}; // lookup table of academic groups rating
  const topRatedCoursesByCriterion = {
    "overall": [],
    "grading": [],
    "content": [],
    "difficulty": [],
    "teaching": [],
  };
  const topRatedAcademicGroupsByCriterion = {
    "overall": [],
    "grading": [],
    "content": [],
    "difficulty": [],
    "teaching": [],
  };
  const criterions = ["grading", "content", "difficulty", "teaching"];

  // calculate sum of each criterion of reviews 
  reviews.forEach(review => {
    const { academic_group } = getCourseById(review.courseId);

    criterions.forEach(criterion => {
      const floatValue = review[criterion]["grade"];
      const courseRated = topRatedCourses[review.courseId];
      const groupRated = topRatedAcademicGroups[academic_group];

      if (courseRated) {
        courseRated[criterion] = floatValue;
        courseRated["overall"] += floatValue;
      } else {
        topRatedCourses[review.courseId] = {
          [criterion]: floatValue,
          "overall": floatValue,
          "numReviews": 1,
        };
      }

      if (groupRated) {
        groupRated[criterion] = floatValue;
        groupRated["overall"] += floatValue;
      } else {
        topRatedAcademicGroups[academic_group] = {
          [criterion]: floatValue,
          "overall": floatValue,
          "numReviews": 1,
        };
      }
    });

    topRatedCourses[review.courseId]["numReviews"]++;
    topRatedAcademicGroups[academic_group]["numReviews"]++;
  });

  // calculate average of each criterion of reviews
  Object.keys(topRatedCourses)
    .forEach(courseId => {
      const courseRated = topRatedCourses[courseId];
      criterions.forEach(criterion =>
        courseRated[criterion] = courseRated[criterion] / courseRated["numReviews"]
      );
      courseRated["overall"] = courseRated["overall"] / (courseRated["numReviews"] * criterions.length);
    });

  Object.keys(topRatedAcademicGroups)
    .forEach(academic_group => {
      const groupRated = topRatedAcademicGroups[academic_group];
      criterions.forEach(criterion =>
        groupRated[criterion] = groupRated[criterion] / groupRated["numReviews"]
      );
      groupRated["overall"] = groupRated["overall"] / (groupRated["numReviews"] * criterions.length);
    });

  // sort courses/academic groups by rating
  [...criterions, "overall"].forEach(criterion => {
    topRatedCoursesByCriterion[criterion] = Object.keys(topRatedCourses)
      .sort((a, b) => topRatedCourses[b][criterion] - topRatedCourses[a][criterion])
      .map(courseId => ({
        courseId,
        course: {
          course: getCourseById(courseId),
        },
        ...topRatedCourses[courseId],
      }));

    topRatedAcademicGroupsByCriterion[criterion] = Object.keys(topRatedAcademicGroups)
      .sort((a, b) => topRatedAcademicGroups[b][criterion] - topRatedAcademicGroups[a][criterion])
      .map(group => ({
        name: group,
        ...topRatedAcademicGroups[group],
      }));
  });

  rankingCache.set('top-rated-courses', topRatedCourses);
  rankingCache.set('top-rated-courses-by-criterion', topRatedCoursesByCriterion);
  rankingCache.set('top-rated-academic-groups', topRatedAcademicGroups);
  rankingCache.set('top-rated-academic-groups-by-criterion', topRatedAcademicGroupsByCriterion);

  return { topRatedCourses, topRatedCoursesByCriterion, topRatedAcademicGroups, topRatedAcademicGroupsByCriterion };
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
    return popularCourses.slice(0, limit);
  },
  topRatedCourses: async (parent, { filter }) => {
    const { limit, sortBy } = filter;
    const cachedTopRatedCourses = rankingCache.get('top-rated-courses-by-criterion');
    if (cachedTopRatedCourses) {
      return cachedTopRatedCourses[sortBy].slice(0, limit);
    }
    const { topRatedCoursesByCriterion } = await calculateTopRatedCourses();
    return topRatedCoursesByCriterion[sortBy].slice(0, limit);
  },
  topRatedAcademicGroups: async (parent, { filter }) => {
    const { limit, sortBy } = filter;
    const cachedTopRatedGroups = rankingCache.get('top-rated-academic-groups-by-criterion');
    if (cachedTopRatedGroups) {
      return cachedTopRatedGroups[sortBy].slice(0, limit);
    }
    const { topRatedAcademicGroupsByCriterion } = await calculateTopRatedCourses();
    return topRatedAcademicGroupsByCriterion[sortBy].slice(0, limit);
  },
};

exports.Course = {
  rating: async ({ idsContext, course }) => {
    const courseId = idsContext.subject + course.code;
    const rating = await getCourseRating(courseId);
    return rating;
  },
};
