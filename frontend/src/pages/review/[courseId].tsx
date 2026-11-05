import { GetStaticPaths } from 'next';

import { getAttrs } from '../../helpers';
import { REVIEW_COURSE_INFO_ATTRS } from '../../config';
import CatalogCoursePage from '../../components/review/CatalogCoursePage';

// SSR to get course info
export const getStaticProps = async ({ params }) => {
  const { courses } = await import('../../../tools/coursesLoader');
  const courseInfo = getAttrs(
    courses[params.courseId],
    ...REVIEW_COURSE_INFO_ATTRS
  );
  return {
    props: {
      c: courseInfo,
    },
  };
};

// Get all valid paths to prerender (i.e. valid courseId)
export const getStaticPaths: GetStaticPaths<{}> = async () => {
  const courses = Object.values(
    await import('../../../../data/derived/courses.json')
  );
  return {
    paths: [...courses]
      .filter(cid => typeof cid === 'string')
      .map(cid => ({
        params: {
          courseId: cid,
        },
      })),
    fallback: false,
  };
};

export default CatalogCoursePage;
