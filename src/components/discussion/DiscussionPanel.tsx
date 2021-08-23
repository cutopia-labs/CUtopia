import { useState } from 'react';
import { DiscussionRecent } from '../../types';
import Card from '../atoms/Card';
import TextIcon from '../atoms/TextIcon';
import SearchDropdown from '../organisms/SearchDropdown';
import Discussion from './Discussion';
import './DiscussionPanel.scss';

const RECENT_DISCUSSIONS_RAW = [
  {
    courseId: 'AIST1110',
    text: 'Hasd asd asd ',
    user: 'mike',
  },
  {
    courseId: 'CSCI1110',
    text: 'Hasd asd asd ',
    user: 'mike',
  },
  {
    courseId: 'CHLT1110',
    text: 'Hasd asd asd ',
    user: 'mike',
  },
  {
    courseId: 'HIST1110',
    text: 'Hasd asd asd ',
    user: 'mike',
  },
  {
    courseId: 'CSCI1110',
    text: 'Hasd asd asd ',
    user: 'mike',
  },
  {
    courseId: 'CHLT1110',
    text: 'Hasd asd asd ',
    user: 'mike',
  },
  {
    courseId: 'PHYS1110',
    text: 'Hasd asd asasdklmf lksadmf masdflk masdlkfm asldkfm d ',
    user: 'mike',
  },
  {
    courseId: 'CSCI1110',
    text: 'Hasd asd asd ',
    user: 'mike',
  },
  {
    courseId: 'CHLT1110',
    text: 'Hasd asd asd ',
    user: 'mike',
  },
  {
    courseId: 'CSCI1110',
    text: 'Hasd asd asd ',
    user: 'mike',
  },
  {
    courseId: 'CHLT1110',
    text: 'Hasd asd asd ',
    user: 'mike',
  },
  {
    courseId: 'CSCI1110',
    text: 'Hasd asd asd ',
    user: 'mike',
  },
  {
    courseId: 'CHLT1110',
    text: 'Hasd asd asd ',
    user: 'mike',
  },
  {
    courseId: 'PHED1110',
    text: 'Hasd asd asd ',
    user: 'mike',
  },
];

type DiscussionListItemProps = {
  discussion: DiscussionRecent;
  onClick: (courseId) => any;
};

const DiscussionListItem = ({
  discussion,
  onClick,
}: DiscussionListItemProps) => {
  return (
    <div
      className={'discussion-item list-item-container hover-bg'}
      onClick={() => onClick(discussion.courseId)}
    >
      <TextIcon text={discussion.courseId} size={28} />
      <span className="list-item-title-container column">
        <span className="list-item-title title">{discussion.courseId}</span>
        <span className="list-item-caption caption ellipsis-text">{`${discussion.user}: ${discussion.text}`}</span>
      </span>
    </div>
  );
};

const DiscussionPanel = () => {
  const [courseId, setCourseId] = useState('AIST1110');
  return (
    <Card className="discussion-panel">
      <Card inPlace title="Discussions" className="discussion-list">
        <SearchDropdown />
        <div className="recent-discussions">
          {RECENT_DISCUSSIONS_RAW.map((discussion) => (
            <DiscussionListItem
              key={JSON.stringify(discussion)}
              discussion={discussion}
              onClick={setCourseId}
            />
          ))}
        </div>
      </Card>
      <div className="messages-wrapper">
        <Discussion courseId={courseId} />
      </div>
    </Card>
  );
};

export default DiscussionPanel;
