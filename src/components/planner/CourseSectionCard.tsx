import { useQuery } from '@apollo/client';
import { FC } from 'react';
import { CURRENT_TERM } from '../../config';
import { COURSE_SECTIONS_QUERY } from '../../constants/queries';
import { validCourse } from '../../helpers';
import { useView } from '../../store';
import Loading from '../atoms/Loading';
import CourseCard from '../review/CourseCard';

type Props = {
  courseId: string;
};

const CourseSectionCard: FC<Props> = ({ courseId }) => {
  const view = useView();
  // Fetch course info
  const { data: courseInfo, loading: courseInfoLoading } = useQuery(
    COURSE_SECTIONS_QUERY,
    {
      skip: !courseId || !validCourse(courseId),
      variables: {
        courseId,
        term: CURRENT_TERM,
      },
      onError: view.handleError,
    }
  );
  if (!courseInfo) return null;
  if (courseInfoLoading) return <Loading />;
  return (
    <CourseCard
      courseInfo={{
        ...courseInfo?.course,
        courseId,
      }}
      concise
    />
  );
};

export default CourseSectionCard;
