const fs = require('fs');

const subjects = {};
const subjectNames = [];
fs.readdirSync(`${__dirname}/data`).forEach(subjectFileName => {
  const subject = JSON.parse(fs.readFileSync(`${__dirname}/data/${subjectFileName}`));
  const subjectName = subjectFileName.split('.')[0];
  subjects[subjectName] = subject;
  subjectNames.push(subjectName);
});

exports.Query = {
  subjects: (parent, { filter }) => {
    const defaultFilter = {
      requiredSubjects: null,
    };
    const { requiredSubjects } = {
      ...defaultFilter,
      ...filter,
    };

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

exports.Subject = {};

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

exports.CourseSection = {
  startTimes: ({ startTimes }) => startTimes[0],
  endTimes: ({ endTimes }) => endTimes[0],
  days: ({ days }) => days[0],
  locations: ({ locations }) => locations[0],
  instructors: ({ instructors }) => instructors[0],
};

exports.AssessementComponent = {};
