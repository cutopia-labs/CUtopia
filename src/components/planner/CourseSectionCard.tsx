import { useQuery } from '@apollo/client';
import { FC, useState } from 'react';
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
  const [term, setTerm] = useState(CURRENT_TERM);
  const view = useView();
  // Fetch course info
  const { data: courseInfo, loading: courseInfoLoading } = useQuery(
    COURSE_SECTIONS_QUERY,
    {
      skip: !courseId || !validCourse(courseId),
      variables: {
        courseId,
        term,
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
