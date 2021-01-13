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
  courses: ({ courses }, { filter }) => {
    const { requiredCourses = null } = { ...filter };

    let filteredCourses = courses;
    if (requiredCourses) {
      filteredCourses = courses.filter(course => requiredCourses.includes(course.code));
    }
    return filteredCourses;
  },
};

exports.Course = {
  terms_sections: ({ terms }) => {
    if (terms === undefined) {
      return null;
    }

    const termsNames = Object.keys(terms);
    return termsNames.map(termName => ({
      termName,
      sections: terms[termName],
    }));
  },
  assessments: ({ assessments }) => {
    if (assessments === undefined) {
      return null;
    }

    return Object.keys(assessments).map(assessment => ({
      name: assessment,
      percentage: assessments[assessment],
    }));
  },
};

exports.TermSections = {
  sections: ({ sections }) => {
    const sectionsNames = Object.keys(sections);
    return sectionsNames.map(sectionName => ({
      name: sectionName,
      ...sections[sectionName],
    }));
  }
};

exports.AssessementComponent = {};
