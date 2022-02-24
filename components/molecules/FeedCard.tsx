import clsx from 'clsx';

import '../../styles/components/molecules/FeedCard.scss';
import { CourseConcise } from '../../types';
import Card, { CardProps } from '../atoms/Card';
import ListItem from './ListItem';

type FeedCardProps = {
  courses: CourseConcise[];
  onItemClick: (course: CourseConcise) => any;
};

const FeedCard = ({
  title,
  className,
  courses,
  onItemClick,
  ...props
}: FeedCardProps & CardProps) => (
  <Card className={clsx('feed-card', className)} title={title} {...props}>
    {courses.map(course => (
      <ListItem
        key={course.courseId}
        title={course.courseId}
        caption={course.title}
        onClick={() => onItemClick(course)}
        noBorder
      />
    ))}
  </Card>
);

export default FeedCard;
