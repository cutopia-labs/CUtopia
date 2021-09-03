import { useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { IconButton } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import { useTitle } from 'react-use';
import { MESSAGE_PREVIEW_LENGTH } from '../../constants/configs';
import { validCourse } from '../../helpers';
import { UserContext } from '../../store';
import { DiscussionRecent, ErrorCardMode } from '../../types';
import Card from '../atoms/Card';
import CardHeader from '../atoms/CardHeader';
import TextIcon from '../atoms/TextIcon';
import ErrorCard from '../molecules/ErrorCard';
import SearchDropdown from '../organisms/SearchDropdown';
import useMobileQuery from '../../hooks/useMobileQuery';
import Discussion from './Discussion';
import './DiscussionPanel.scss';

const getDiscussionFromString = (str: string) => {
  const [courseId, text] = str.split('#');
  return {
    text: `${text}${text.length < MESSAGE_PREVIEW_LENGTH ? '' : '...'}`,
    user: 'me',
    courseId,
  };
};

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
  const { courseId } = useParams<{
    courseId?: string;
  }>();
  useTitle(`Discussion${courseId ? ` | ${courseId}` : ''}`);
  const history = useHistory();
  const user = useContext(UserContext);
  const isMobile = useMobileQuery();
  return (
    <Card className="discussion-panel">
      {(!isMobile || !validCourse(courseId)) && (
        <Card inPlace title="Discussions" className="discussion-list">
          <SearchDropdown
            skipDefaultAction
            onCoursePress={courseId => {
              history.push(`/discussion/${courseId}`);
            }}
          />
          <div className="recent-discussions">
            {user.discussionHistory?.length ? (
              user.discussionHistory.map(discussion => (
                <DiscussionListItem
                  key={discussion.time}
                  discussion={discussion}
                  onClick={courseId => history.push(`/discussion/${courseId}`)}
                />
              ))
            ) : (
              <ErrorCard mode={ErrorCardMode.NULL} />
            )}
          </div>
        </Card>
      )}
      {validCourse(courseId) ? (
        <div className="messages-wrapper">
          <CardHeader
            left={
              isMobile && (
                <IconButton
                  size="small"
                  onClick={() => history.push('/discussion')}
                >
                  <ArrowBack />
                </IconButton>
              )
            }
            title={courseId}
          />
          <Discussion courseId={courseId} />
        </div>
      ) : (
        !isMobile && (
          <ErrorCard
            mode={ErrorCardMode.NULL}
            caption="Select a course to start discussion!"
          />
        )
      )}
    </Card>
  );
};

export default observer(DiscussionPanel);
