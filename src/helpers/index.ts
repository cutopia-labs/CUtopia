export const getSubjectAndCode = (courseId: string) => ({
  subject: courseId.substring(0, 4),
  code: courseId.substring(4),
});

export const generateRandomArray = (
  length: number,
  limit: number
): Set<number> => {
  const result: Set<number> = new Set();
  while (result.size < length) {
    result.add(Math.floor(Math.random() * limit));
  }
  return result;
};
