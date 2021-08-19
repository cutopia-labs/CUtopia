export const getSubjectAndCode = (courseId: string) => ({
  subject: courseId.substring(0, 4),
  code: courseId.substring(4),
});
