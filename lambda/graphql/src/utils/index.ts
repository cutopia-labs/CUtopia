import { ErrorCode } from 'cutopia-types/lib/codes';
import subject_course_names from '../data/derivatives/subject_course_names.json';

const subjectSet = Object.fromEntries(
  Object.entries(subject_course_names)
    .map(([subject, codeList]) => codeList.map(code => [subject + code, true]))
    .flat()
);

export const verifyCourseId = (courseId: string) => {
  if (!subjectSet[courseId]) {
    throw Error(ErrorCode.INVALID_COURSE_ID.toString());
  }
};
