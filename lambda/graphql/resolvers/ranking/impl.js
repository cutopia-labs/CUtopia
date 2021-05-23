const { getReviews } = require('dynamodb');
const { subjects } = require('../../data/courses');
const NodeCache = require('node-cache');

const rankingCache = new NodeCache({
  stdTTL: 1800,
  useClones: false,
});

const criterions = ["grading", "content", "difficulty", "teaching"];

const calculateAverage = (coursesRating, topRatedAcademicGroups) => {
  // calculate average of each criterion of reviews
  Object.keys(coursesRating)
    .forEach(courseId => {
      const courseRated = coursesRating[courseId];
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
};

const sortTopRatedCourses = (coursesRating, topRatedAcademicGroups) => {
  // sort courses/academic groups by rating
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

  [...criterions, "overall"].forEach(criterion => {
    topRatedCoursesByCriterion[criterion] = Object.keys(coursesRating)
      .sort((a, b) => coursesRating[b][criterion] - coursesRating[a][criterion])
      .map(courseId => ({
        courseId,
        course: {
          course: this.getCourseById(courseId),
        },
        ...coursesRating[courseId],
      }));

    topRatedAcademicGroupsByCriterion[criterion] = Object.keys(topRatedAcademicGroups)
      .sort((a, b) => topRatedAcademicGroups[b][criterion] - topRatedAcademicGroups[a][criterion])
      .map(group => ({
        name: group,
        ...topRatedAcademicGroups[group],
      }));
  });
  rankingCache.set('top-rated-courses-by-criterion', topRatedCoursesByCriterion);
  rankingCache.set('top-rated-academic-groups-by-criterion', topRatedAcademicGroupsByCriterion);
};

const calculateNewSum = (oldSum, numReviews, newValue) => {
  const newSum = oldSum * numReviews + newValue;
  return newSum / (numReviews + 1);
};

const updateCoursesRating = (courseId, reviewData) => {
  // update course rating when adding new review
  const coursesRating = rankingCache.get('courses-rating');
  const academicGroupsRating = rankingCache.get('academic-groups-rating');

  const course = coursesRating[courseId];
  let overall = 0;
  criterions.forEach(criterion => {
    const newSum = calculateNewSum(course[criterion], course["numReviews"], reviewData[criterion]["grade"]);
    course[criterion] = newSum;
    overall += newSum;
  });
  course["overall"] = overall / criterions.length;
  course["numReviews"]++;
  rankingCache.set('courses-rating', coursesRating);

  overall = 0;
  const { academic_group } = this.getCourseById(courseId);
  const group = academicGroupsRating[academic_group];

  criterions.forEach(criterion => {
    const newSum = calculateNewSum(group[criterion], group["numReviews"], reviewData[criterion]["grade"]);
    group[criterion] = newSum;
    overall += newSum;
  });
  group["overall"] = overall / criterions.length;
  group["numReviews"]++;
  rankingCache.set('academic-groups-rating', academicGroupsRating);

  return { coursesRating, academicGroupsRating };
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
    getAll: true,
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
        course: this.getCourseById(courseId),
      },
      numReviews: popularCourses[courseId],
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
    getAll: true,
  });
  const courseRating = {}; // lookup table of course rating
  const academicGroupsRating = {}; // lookup table of academic groups rating

  // calculate sum of each criterion of reviews 
  reviews.forEach(review => {
    const { academic_group } = this.getCourseById(review.courseId);

    criterions.forEach(criterion => {
      const floatValue = review[criterion]["grade"];
      const courseRated = courseRating[review.courseId];
      const groupRated = academicGroupsRating[academic_group];

      if (courseRated) {
        courseRated[criterion] += floatValue;
        courseRated["overall"] += floatValue;
      } else {
        courseRating[review.courseId] = {
          "grading": 0,
          "content": 0,
          "difficulty": 0,
          "teaching": 0,
          "overall": floatValue,
          "numReviews": 0,
        };
        courseRating[review.courseId][criterion] = floatValue;
      }

      if (groupRated) {
        groupRated[criterion] += floatValue;
        groupRated["overall"] += floatValue;
      } else {
        academicGroupsRating[academic_group] = {
          "grading": 0,
          "content": 0,
          "difficulty": 0,
          "teaching": 0,
          "overall": floatValue,
          "numReviews": 0,
        };
        academicGroupsRating[academic_group][criterion] = floatValue;
      }
    });

    courseRating[review.courseId]["numReviews"]++;
    academicGroupsRating[academic_group]["numReviews"]++;
  });

  calculateAverage(courseRating, academicGroupsRating);

  sortTopRatedCourses(courseRating, academicGroupsRating);

  rankingCache.set('courses-rating', courseRating);
  rankingCache.set('academic-groups-rating', academicGroupsRating);
  return rankingCache.get(type);
};

exports.recalWithNewReview = async (review) => {
  const { courseId, ...reviewData } = review;
  const popularCourses = await this.calculatePopularCourses();
  let index = popularCourses.findIndex(course => course.courseId === courseId);
  if (index === -1) {
    // first review of the course
    popularCourses.push({
      courseId,
      course: {
        course: this.getCourseById(courseId),
      },
      numReviews: 1,
    });
    rankingCache.set('popular-courses', popularCourses);
    return;
  }
  popularCourses[index].numReviews++;
  rankingCache.set('popular-courses', popularCourses);

  const coursesByCriterion = await this.calculateTopRatedCourses('top-rated-courses-by-criterion');
  criterions.forEach(criterion => {
    index = coursesByCriterion[criterion].findIndex(course => course.courseId === courseId);
    const targetCourse = coursesByCriterion[criterion][index];
    const numReviews = targetCourse["numReviews"];
    const grade = reviewData[criterion]["grade"];
    let overall = 0;
    criterions.forEach(c => {
      const newSum = calculateNewSum(targetCourse[c], numReviews, grade);
      overall += newSum;
      targetCourse[c] = newSum;
    });
    targetCourse["overall"] = overall / criterions.length;
    targetCourse["numReviews"]++;
  });
  const { coursesRating, academicGroupsRating } = updateCoursesRating(courseId, reviewData);
  sortTopRatedCourses(coursesRating, academicGroupsRating);
};
