import { useQuery } from '@apollo/client';
import { useContext, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { IconButton } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { MESSAGE_PREVIEW_LENGTH } from '../../constants/configs';
import Loading from '../atoms/Loading';
import { GET_MY_DISCUSSIONS } from '../../constants/queries';
import { validCourse } from '../../helpers';
import { ViewContext } from '../../store';
import { DiscussionRecent, ErrorCardMode } from '../../types';
import Card from '../atoms/Card';
import CardHeader from '../atoms/CardHeader';
import TextIcon from '../atoms/TextIcon';
import ErrorCard from '../molecules/ErrorCard';
import SearchDropdown from '../organisms/SearchDropdown';
import Discussion from './Discussion';
import './DiscussionPanel.scss';
import useMobileQuery from '../../hooks/useMobileQuery';

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
  const history = useHistory();
  const view = useContext(ViewContext);
  const { data: userData, loading: userDataLoading } = useQuery(
    GET_MY_DISCUSSIONS,
    {
      onError: view.handleError,
    }
  );
  const isMobile = useMobileQuery();
  useEffect(() => {
    console.log(courseId);
  }, [courseId]);
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
            {userDataLoading && <Loading />}
            {(userData?.me?.discussions || []).map(discussionRaw => (
              <DiscussionListItem
                key={discussionRaw}
                discussion={getDiscussionFromString(discussionRaw)}
                onClick={courseId => history.push(`/discussion/${courseId}`)}
              />
            ))}
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

export default DiscussionPanel;
