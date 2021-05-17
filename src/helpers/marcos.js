const validCourse = coursename => {
  const rules = new RegExp(/^[a-z]{4}\d{4}$/i);
  return rules.test(coursename);
};

export {
  validCourse,
};
