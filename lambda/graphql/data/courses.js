const fs = require('fs');
const Fuse = require('fuse.js');

const subjects = {};
const subjectNames = [];
const flattenCourses = [];

fs.readdirSync(`${__dirname}/courses`).forEach(subjectFileName => {
  const courses = JSON.parse(fs.readFileSync(`${__dirname}/courses/${subjectFileName}`));
  if (courses.length !== 0) {
    const subjectName = subjectFileName.split('.')[0];
    subjects[subjectName] = courses;
    subjectNames.push(subjectName);

    courses.map(course => flattenCourses.push({
      subject: subjectName,
      course
    }));
  }
});

const fuse = new Fuse(flattenCourses, {
  keys: ['subject', 'course.code', 'course.title'],
  distance: 10
});

const searchCourses = (text, limit) => {
  const items = fuse.search(text, { limit }).map(result => result.item);
  return items;
};

module.exports = {
  subjects,
  subjectNames,
  searchCourses
};
