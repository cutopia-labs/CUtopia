import { ErrorCode } from 'cutopia-types/lib/codes';
import { GraphQLScalarType } from 'graphql';

import courseIds from '../data/derived/subject_course_names.json';

const validateCourseId = (courseId: string) => {
  const subject = courseId.slice(0, 4);
  const course = courseId.slice(4, 8);
  return courseIds[subject]?.includes(course);
};

export default new GraphQLScalarType({
  name: 'CourseID',
  description: 'Validate course ID',
  parseValue: (value: string) => {
    if (!validateCourseId(value)) {
      throw Error(ErrorCode.INVALID_COURSE_ID.toString());
    }
    return value.slice(0, 8);
  },
});
