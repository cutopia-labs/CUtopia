import { Link } from 'react-router-dom';

import './HomePageTabs.scss';
import ListItem from '../molecules/ListItem';
import Loading from '../atoms/Loading';
import { getMMMDDYY } from '../../helpers/getTime';
import { CourseConcise } from '../../types';

type CoursesListProps = {
  loading: boolean;
  courses: CourseConcise[];
};

const CoursesList = ({ loading, courses }: CoursesListProps) => (
  <>
    {loading ? (
      <Loading />
    ) : (
      <div className="home-course-container card">
        {courses?.map((course) => (
          <Link key={course.courseId} to={`/review/${course.courseId}`}>
            <ListItem
              className="search-list-item column home-course-list-item"
              label={course.courseId}
              caption={course.title}
              noBorder
            />
          </Link>
        ))}
      </div>
    )}
  </>
);

type ReviewsListProps = {
  loading: boolean;
  reviewIds: string[];
};

const ReviewsList = ({ loading, reviewIds }: ReviewsListProps) => (
  <>
    {loading ? (
      <Loading />
    ) : (
      <div className="home-course-container card">
        {reviewIds?.map((id) => {
          const [courseId, createdDate] = id.split('#');
          return (
            <Link key={id} to={`/review/${courseId}/${createdDate}`}>
              <ListItem
                className="search-list-item column home-course-list-item"
                label={courseId}
                caption={getMMMDDYY(createdDate)}
                noBorder
              />
            </Link>
          );
        })}
      </div>
    )}
  </>
);

export { CoursesList, ReviewsList };
