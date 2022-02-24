import { Skeleton } from '@material-ui/lab';
import '../../styles/components/templates/Skeleton.scss';
export const CourseCardSkeleton = (
  <div className="course-card-skeleton">
    <header className="center-row">
      <span className="column">
        <Skeleton width={200} height={56} />
        <Skeleton />
      </span>
      <Skeleton height={50} />
    </header>
    <Skeleton className="content-skeleton" height={280} />
  </div>
);
