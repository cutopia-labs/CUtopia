import { useState } from 'react';
import AccordionCard from '../atoms/AccordionCard';
import Discussion from './Discussion';
import './DiscussionCard';

const DiscussionCard = ({ courseId }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <AccordionCard
      expanded={expanded}
      onChange={(e, expanded) => setExpanded(expanded)}
      title="Discussion"
      className="discussion-card"
    >
      <Discussion courseId={courseId} />
    </AccordionCard>
  );
};

export default DiscussionCard;
