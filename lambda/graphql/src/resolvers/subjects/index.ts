/* eslint-disable camelcase */ // course_sections is not in camelcase when parsing the data

const { subjects, subjectNames } = require('../../data/courses');
const { getCourseData } = require('dynamodb');

exports.Query = {
  subjects: (parent, { filter }) => {
    const { requiredSubjects = null } = { ...filter };

    let filteredSubjects = subjectNames;
    if (requiredSubjects) {
      filteredSubjects = requiredSubjects.filter(subName => subjectNames.includes(subName));
    }
    return filteredSubjects.map(subName => ({
      name: subName,
      courses: subjects[subName]
    }));
  }
};

exports.Subject = {
  courses: ({ name, courses }, { filter }) => {
    const idsContext = {
      subject: name,
      courseCode: null,
      term: null,
      section: null
    };

    const { requiredCourses = null } = { ...filter };

    let filteredCourses = courses;
    if (requiredCourses) {
      filteredCourses = courses.filter(course => requiredCourses.includes(course.code));
    }
    return filteredCourses.map(course => ({
      idsContext,
      course
    }));
  }
};

exports.Course = {
  code: ({ course }) => course.code,
  title: ({ course }) => course.title,
  reviewLecturers: async ({ idsContext, course }) => {
    // TODO: reviewLecturers and reviewTerms query database twice instead of once before getting cached
    const courseId = idsContext.subject + course.code;
    const result = await getCourseData({ courseId });
    return (result === undefined || result.lecturers === undefined) ? [] : result.lecturers.values;
  },
  reviewTerms: async ({ idsContext, course }) => {
    const courseId = idsContext.subject + course.code;
    const result = await getCourseData({ courseId });
    return (result === undefined || result.terms === undefined) ? [] : result.terms.values;
  },
  career: ({ course }) => course.career,
  units: ({ course }) => course.units,
  grading: ({ course }) => course.grading,
  components: ({ course }) => course.components,
  campus: ({ course }) => course.campus,
  academic_group: ({ course }) => course.academic_group,
  requirements: ({ course }) => course.requirements,
  description: ({ course }) => course.description,
  outcome: ({ course }) => course.outcome,
  syllabus: ({ course }) => course.syllabus,
  required_readings: ({ course }) => course.required_readings,
  recommended_readings: ({ course }) => course.recommended_readings,
  terms: ({ idsContext, course }) => {
    const { code, terms } = course;
    if (terms === undefined) {
      return null;
    }

    const termsNames = Object.keys(terms);
    return termsNames.map(term => ({
      idsContext: {
        ...idsContext,
        courseCode: code,
        term
      },
      course_sections: terms[term]
    }));
  },
  assessments: ({ course }) => {
    const { assessments } = course;
    if (assessments === undefined) {
      return null;
    }

    return Object.keys(assessments).map(assessment => ({
      name: assessment,
      percentage: assessments[assessment]
    }));
  }
};

exports.Term = {
  name: ({ idsContext }) => idsContext.term,
  course_sections: ({ idsContext, course_sections }) => {
    const sectionsNames = Object.keys(course_sections);
    return sectionsNames.map(section => ({
      idsContext: {
        ...idsContext,
        section
      },
      ...course_sections[section]
    }));
  }
};

exports.CourseSection = {
  name: ({ idsContext }) => idsContext.section
};

exports.AssessementComponent = {};
