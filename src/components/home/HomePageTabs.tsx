import Link from 'next/link';
import clsx from 'clsx';
import { FC } from 'react';
import styles from '../../styles/components/home/HomePageTabs.module.scss';
import ListItem from '../molecules/ListItem';
import Loading from '../atoms/Loading';
import { getMMMDDYY } from '../../helpers/getTime';
import { CourseConcise, ErrorCardMode } from '../../types';
import ErrorCard from '../molecules/ErrorCard';

type CoursesListProps = {
  loading: boolean;
  courses: CourseConcise[];
};

export const CoursesList: FC<CoursesListProps> = ({ loading, courses }) => {
  if (!courses.length) {
    return <ErrorCard mode={ErrorCardMode.NULL} inPlace={false} />;
  }
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className={clsx(styles.homeCourseContainer, 'card')}>
          {courses?.map(course => (
            <Link key={course.courseId} href={`/review/${course.courseId}`}>
              <ListItem
                className={styles.homeCourseListItem}
                title={course.courseId}
                caption={course.title}
                noBorder
              />
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

type ReviewsListProps = {
  reviewIds: string[];
};

export const ReviewsList: FC<ReviewsListProps> = ({ reviewIds }) => {
  if (!reviewIds?.length) {
    return <ErrorCard mode={ErrorCardMode.NULL} inPlace={false} />;
  }
  return (
    <div className={clsx(styles.homeCourseContainer, 'card')}>
      {reviewIds?.map(id => {
        const [courseId, createdAt] = id.split('#');
        return (
          <Link key={id} href={`/review/${courseId}?rid=${createdAt}`}>
            <ListItem
              className={styles.homeCourseListItem}
              title={courseId}
              caption={getMMMDDYY(createdAt)}
              noBorder
            />
          </Link>
        );
      })}
    </div>
  );
};
