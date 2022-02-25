import Link from 'next/link';
import '../../styles/components/home/HomePageTabs.module.scss';
import ListItem from '../molecules/ListItem';
import Loading from '../atoms/Loading';
import { getMMMDDYY } from '../../helpers/getTime';
import { CourseConcise, ErrorCardMode } from '../../types';
import ErrorCard from '../molecules/ErrorCard';

type CoursesListProps = {
  loading: boolean;
  courses: CourseConcise[];
};

export const CoursesList = ({ loading, courses }: CoursesListProps) => {
  if (!courses.length) {
    return <ErrorCard mode={ErrorCardMode.NULL} inPlace={false} />;
  }
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="home-course-container card">
          {courses?.map(course => (
            <Link key={course.courseId} href={`/review/${course.courseId}`}>
              <ListItem
                className="home-course-list-item"
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

export const ReviewsList = ({ reviewIds }: ReviewsListProps) => {
  if (!reviewIds?.length) {
    return <ErrorCard mode={ErrorCardMode.NULL} inPlace={false} />;
  }
  return (
    <div className="home-course-container card">
      {reviewIds?.map(id => {
        const [courseId, createdAt] = id.split('#');
        return (
          <Link key={id} href={`/review/${courseId}/${createdAt}`}>
            <ListItem
              className="home-course-list-item"
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