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

exports.Subject = {
};

exports.Course = {
};
