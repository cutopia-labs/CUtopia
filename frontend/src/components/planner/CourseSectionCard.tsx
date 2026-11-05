import { useQuery } from '@apollo/client';
import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { COURSE_PLANNER_INFO_QUERY } from '../../constants/queries';
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
    COURSE_PLANNER_INFO_QUERY,
    {
      skip: !courseId || !validCourse(courseId),
      variables: {
        courseId,
      },
      onError: view.handleError,
    }
  );
  if (!courseId) return null;
  if (courseInfoLoading && !courseInfo) return <Loading />;
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

export default observer(CourseSectionCard);
