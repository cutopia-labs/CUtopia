const fs = require('fs');

const subjects = {};
const subjectNames = [];
fs.readdirSync(`${__dirname}/data`).forEach(subjectFileName => {
  const subject = JSON.parse(fs.readFileSync(`${__dirname}/data/${subjectFileName}`));
  if (subject.length !== 0) {
    const subjectName = subjectFileName.split('.')[0];
    subjects[subjectName] = subject;
    subjectNames.push(subjectName);
  }
});

const mock1 = {
  subject: 'AIST',
  code: '1000',
  term: '2020-21 Term 1',
  section: '--LEC (4742)',
  author: 'zzzzzzz',
  anonymous: true,
  lecturer: 'Dr. CHAU Chuck Jee, \n\rMr. FUNG Ping Fu',
  createdTime: '1608738619',
  modifiedTime: '1608738619',
  overall: 'A-',
  grading: {
    review: 'Leng grade',
    grade: 'A-',
  },
  teaching: {
    review: 'Good',
    grade: 'B',
  },
  difficulty: {
    review: 'Easy for programmer',
    grade: 'A',
  },
  content: {
    review: 'This course aims to provide an intensive hands-on introduction to the Python programming language. Topics include Python programming language syntax, basic data types, operators for various data types, function definition and usage, file and operating system support, object-oriented programming, functional programming, module creation, visualization, multi-threaded programming, networking, cryptography, web/database access. The course will go through some important Python packages for artificial intelligence and machine learning applications, e.g., NumPy and SciPy, and use these packages to accomplish some simple artificial intelligence and machine learning tasks.',
    grade: 'A-',
  },
};

const mock2 = {
  subject: 'ENGG',
  code: '2440',
  term: '2020-21 Term 1',
  section: 'B-LEC (8967)',
  author: 'blablabla',
  anonymous: false,
  lecturer: 'Dr. Ng',
  createdTime: '1610524219',
  modifiedTime: '1610524219',
  overall: 'B-',
  grading: {
    review: 'Broken grade',
    grade: 'B-',
  },
  teaching: {
    review: 'Not bad',
    grade: 'B',
  },
  difficulty: {
    review: 'Easy for programmer',
    grade: 'A',
  },
  content: {
    review: 'This course aims to provide an intensive hands-on introduction to the Python programming language. Topics include Python programming language syntax, basic data types, operators for various data types, function definition and usage, file and operating system support, object-oriented programming, functional programming, module creation, visualization, multi-threaded programming, networking, cryptography, web/database access. The course will go through some important Python packages for artificial intelligence and machine learning applications, e.g., NumPy and SciPy, and use these packages to accomplish some simple artificial intelligence and machine learning tasks.',
    grade: 'A-',
  },
};

const mockReviews = [mock1, mock2];

exports.Query = {
  subjects: (parent, { filter }) => {
    const { requiredSubjects = null } = { ...filter };

    let filteredSubjects = subjectNames;
    if (requiredSubjects) {
      filteredSubjects = requiredSubjects.filter(subName => subjectNames.includes(subName));
    }
    return filteredSubjects.map(subName => ({
      name: subName,
      courses: subjects[subName],
    }));
  },
};

exports.Subject = {
  courses: ({ name, courses }, { filter }) => {
    const idsContext = {
      subjectName: name,
      courseCode: null,
      termName: null,
      sectionName: null,
    };

    const { requiredCourses = null } = { ...filter };

    let filteredCourses = courses;
    if (requiredCourses) {
      filteredCourses = courses.filter(course => requiredCourses.includes(course.code));
    }
    return filteredCourses.map(course => ({
      idsContext,
      course,
    }));
  },
};

exports.Course = {
  code: ({ course }) => course.code,
  title: ({ course }) => course.title,
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
    return termsNames.map(termName => ({
      idsContext: {
        ...idsContext,
        courseCode: code,
        termName,
      },
      course_sections: terms[termName],
    }));
  },
  assessments: ({ course }) => {
    const { assessments } = course;
    if (assessments === undefined) {
      return null;
    }

    return Object.keys(assessments).map(assessment => ({
      name: assessment,
      percentage: assessments[assessment],
    }));
  },
};

exports.Term = {
  name: ({ idsContext }) => idsContext.termName,
  course_sections: ({ idsContext, course_sections }) => {
    const sectionsNames = Object.keys(course_sections);
    return sectionsNames.map(sectionName => ({
      idsContext: {
        ...idsContext,
        sectionName,
      },
      ...course_sections[sectionName],
    }));
  }
};

exports.CourseSection = {
  name: ({ idsContext }) => idsContext.sectionName,
  reviews: ({ idsContext }) => {
    const { subjectName, courseCode, termName, sectionName } = idsContext;
    const reviews = mockReviews.filter(review => review.subject === subjectName && review.code === courseCode && review.term === termName && review.section === sectionName);
    return reviews;
  },
};

exports.AssessementComponent = {};

exports.Review = {
  author: ({ author, anonymous }) => {
    return anonymous ? 'Anonymous' : author;
  },
};

exports.ReviewDetails = {};
