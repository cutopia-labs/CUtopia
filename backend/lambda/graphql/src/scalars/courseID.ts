import { ErrorCode } from 'cutopia-types';
import { GraphQLScalarType } from 'graphql';

export default new GraphQLScalarType({
  name: 'CourseID',
  description: 'Validate course ID',
  parseValue: (value: string) => {
    // Existence is checked asynchronously against the selected catalog snapshot.
    if (typeof value !== 'string' || !/^[A-Z]{4}[0-9]{4}$/.test(value)) {
      throw Error(ErrorCode.INVALID_COURSE_ID.toString());
    }
    return value.slice(0, 8);
  },
});
