/* eslint-disable camelcase */ // academic_group is not in camelcase when parsing the data

const { getReviews } = require('dynamodb');
const { subjects } = require('../../data/courses');
const NodeCache = require('node-cache');

const rankingCache = new NodeCache({
  stdTTL: 1800,
  useClones: false
});

const criterions = ['grading', 'content', 'difficulty', 'teaching'];

const calculateAverage = (coursesRating, topRatedAcademicGroups) => {
  // calculate average of each criterion of reviews
  Object.keys(coursesRating)
    .forEach(courseId => {
      const courseRated = coursesRating[courseId];
      criterions.forEach(criterion => {
        courseRated[criterion] = courseRated[criterion] / courseRated.numReviews;
      });
      courseRated.overall = courseRated.overall / (courseRated.numReviews * criterions.length);
    });

  Object.keys(topRatedAcademicGroups)
    .forEach(academic_group => {
      const groupRated = topRatedAcademicGroups[academic_group];
      criterions.forEach(criterion => {
        groupRated[criterion] = groupRated[criterion] / groupRated.numReviews;
      });
      groupRated.overall = groupRated.overall / (groupRated.numReviews * criterions.length);
    });
};

const sortTopRatedCourses = (coursesRating, topRatedAcademicGroups) => {
  // sort courses/academic groups by rating
  const topRatedCoursesByCriterion = {
    overall: [],
    grading: [],
    content: [],
    difficulty: [],
    teaching: []
  };

  const topRatedAcademicGroupsByCriterion = {
    overall: [],
    grading: [],
    content: [],
    difficulty: [],
    teaching: []
  };

  [...criterions, 'overall'].forEach(criterion => {
    topRatedCoursesByCriterion[criterion] = Object.keys(coursesRating)
      .sort((a, b) => coursesRating[b][criterion] - coursesRating[a][criterion])
      .map(courseId => ({
        courseId,
        course: {
          course: this.getCourseById(courseId)
        },
        ...coursesRating[courseId]
      }));

    topRatedAcademicGroupsByCriterion[criterion] = Object.keys(topRatedAcademicGroups)
      .sort((a, b) => topRatedAcademicGroups[b][criterion] - topRatedAcademicGroups[a][criterion])
      .map(group => ({
        name: group,
        ...topRatedAcademicGroups[group]
      }));
  });
  rankingCache.set('top-rated-courses-by-criterion', topRatedCoursesByCriterion);
  rankingCache.set('top-rated-academic-groups-by-criterion', topRatedAcademicGroupsByCriterion);
};

const updateCourseRating = async (courseId, calculateRatingFn, increaseNumReviews = false) => {
  // update course rating when new review is added or existing review is edited
  const coursesRating = rankingCache.get('courses-rating');
  const academicGroupsRating = rankingCache.get('academic-groups-rating');

  let course = coursesRating[courseId];
  let isFirstRating = course === undefined;
  if (isFirstRating) {
    course = {
      numReviews: 0
    };
  }
  let overall = 0;
  criterions.forEach(criterion => {
    const newAvg = calculateRatingFn(course, criterion);
    course[criterion] = newAvg;
    overall += newAvg;
  });
  course.overall = overall / criterions.length;
  if (increaseNumReviews) {
    course.numReviews++;
  }
  if (isFirstRating) {
    coursesRating[courseId] = course;
  }
  rankingCache.set('courses-rating', coursesRating);

  // TODO: refactor the following logic?
  const { academic_group } = this.getCourseById(courseId);
  let group = academicGroupsRating[academic_group];
  overall = 0;
  isFirstRating = group === undefined;
  if (isFirstRating) {
    group = {
      numReviews: 0
    };
  }
  criterions.forEach(criterion => {
    const newAvg = calculateRatingFn(group, criterion);
    group[criterion] = newAvg;
    overall += newAvg;
  });
  group.overall = overall / criterions.length;
  if (increaseNumReviews) {
    group.numReviews++;
  }
  if (isFirstRating) {
    academicGroupsRating[academic_group] = group;
  }
  rankingCache.set('academic-groups-rating', academicGroupsRating);

  sortTopRatedCourses(coursesRating, academicGroupsRating);
  return { courseRatings: course, groupRatings: group };
};

exports.getCourseById = (courseId) => {
  const subjectName = courseId.slice(0, 4);
  const courseCode = courseId.slice(4, 8);
  const courses = subjects[subjectName];
  return courses.filter(course => course.code === courseCode)[0];
};

exports.getCourseRating = async (courseId) => {
  const coursesRating = await this.calculateTopRatedCourses('courses-rating');
  return coursesRating[courseId];
};

exports.calculatePopularCourses = async () => {
  const cachedPopularCourses = rankingCache.get('popular-courses');
  if (cachedPopularCourses) {
    return cachedPopularCourses;
  }

  const reviews = await getReviews({
    getAll: true
  });
  const popularCourses = {};
  reviews.forEach(review => {
    if (popularCourses[review.courseId]) {
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
        course: this.getCourseById(courseId)
      },
      numReviews: popularCourses[courseId]
    }));
  rankingCache.set('popular-courses', result);
  return result;
};

exports.calculateTopRatedCourses = async (type) => {
  const cached = rankingCache.get(type);
  if (cached) {
    return cached;
  }

  const reviews = await getReviews({
    getAll: true
  });
  const courseRating = {}; // lookup table of course rating
  const academicGroupsRating = {}; // lookup table of academic groups rating

  // calculate sum of each criterion of reviews
  reviews.forEach(review => {
    const { academic_group } = this.getCourseById(review.courseId);

    criterions.forEach(criterion => {
      const floatValue = review[criterion].grade;
      const courseRated = courseRating[review.courseId];
      const groupRated = academicGroupsRating[academic_group];

      if (courseRated) {
        courseRated[criterion] += floatValue;
        courseRated.overall += floatValue;
      } else {
        courseRating[review.courseId] = {
          grading: 0,
          content: 0,
          difficulty: 0,
          teaching: 0,
          overall: floatValue,
          numReviews: 0
        };
        courseRating[review.courseId][criterion] = floatValue;
      }

      if (groupRated) {
        groupRated[criterion] += floatValue;
        groupRated.overall += floatValue;
      } else {
        academicGroupsRating[academic_group] = {
          grading: 0,
          content: 0,
          difficulty: 0,
          teaching: 0,
          overall: floatValue,
          numReviews: 0
        };
        academicGroupsRating[academic_group][criterion] = floatValue;
      }
    });

    courseRating[review.courseId].numReviews++;
    academicGroupsRating[academic_group].numReviews++;
  });

  calculateAverage(courseRating, academicGroupsRating);

  sortTopRatedCourses(courseRating, academicGroupsRating);

  rankingCache.set('courses-rating', courseRating);
  rankingCache.set('academic-groups-rating', academicGroupsRating);
  return rankingCache.get(type);
};

exports.recalWithNewReview = async (review) => {
  const { courseId, ...reviewData } = review;
  await this.calculateTopRatedCourses('courses-rating'); // calculate top rated courses in case it does not exist in cache
  const popularCourses = await this.calculatePopularCourses();
  const index = popularCourses.findIndex(course => course.courseId === courseId);
  if (index === -1) {
    // first review of the course
    popularCourses.push({
      courseId,
      course: {
        course: this.getCourseById(courseId)
      },
      numReviews: 1
    });
    rankingCache.set('popular-courses', popularCourses);

    const calculateRating = (course, criterion) => (
      reviewData[criterion].grade
    );
    return updateCourseRating(courseId, calculateRating, true);
  }

  popularCourses[index].numReviews++;
  rankingCache.set('popular-courses', popularCourses);
  const calculateRating = (course, criterion) => (
    (course[criterion] * course.numReviews + reviewData[criterion].grade) / (course.numReviews + 1)
  );
  return updateCourseRating(courseId, calculateRating, true);
};

exports.recalWithEdittedReview = async (review) => {
  const { courseId, oldReviewData, ...reviewData } = review;

  await this.calculateTopRatedCourses('courses-rating'); // calculate top rated courses in case it does not exist in cache
  const calculateRating = (course, criterion) => (
    (course[criterion] * course.numReviews - oldReviewData[criterion].grade + reviewData[criterion].grade) / course.numReviews
  );
  return updateCourseRating(courseId, calculateRating);
};
