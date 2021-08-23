import { useState } from 'react';
import { DiscussionRecent } from '../../types';
import Card from '../atoms/Card';
import ListItem from '../molecules/ListItem';
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
    <ListItem
      className="discussion-item"
      noBorder
      title={discussion.courseId}
      caption={`${discussion.user}: ${discussion.text}`}
      onClick={() => onClick(discussion.courseId)}
    />
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
