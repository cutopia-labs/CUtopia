import { useQuery } from '@apollo/client';
import React, { FC } from 'react';
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
  const {
    data: courseInfo,
    previousData,
    loading: courseInfoLoading,
  } = useQuery(COURSE_PLANNER_INFO_QUERY, {
    skip: !courseId || !validCourse(courseId),
    variables: {
      courseId,
    },
    onError: view.handleError,
  });
  if (!courseId) return null;
  // Catalog invalidation temporarily removes the watched query result. Keep
  // this card mounted during refetch so its explicit semester choice survives.
  const course =
    courseInfo?.course?.courseId === courseId
      ? courseInfo.course
      : previousData?.course?.courseId === courseId
      ? previousData.course
      : null;
  if (courseInfoLoading && !course) return <Loading />;
  return (
    <CourseCard
      courseInfo={{
        ...course,
        courseId,
      }}
      concise
    />
  );
};

export default observer(CourseSectionCard);
