import { useState, useRef, useEffect, FC } from 'react';
import { Button, Divider, IconButton } from '@material-ui/core';
import { RiSendPlaneLine } from 'react-icons/ri';
import { useLazyQuery, useMutation } from '@apollo/client';
import { observer } from 'mobx-react-lite';
import pluralize from 'pluralize';
import clsx from 'clsx';
import { DiscussionMessage } from '../../types';
import { useView, useUser } from '../../store';
import TextField from '../atoms/TextField';
import TextIcon from '../atoms/TextIcon';
import { GET_DISCUSSIONS } from '../../constants/queries';
import { SEND_MESSAGE } from '../../constants/mutations';
import Loading from '../atoms/Loading';

import styles from '../../styles/components/review/CourseComments.module.scss';
import { getMMMDDYY } from '../../helpers/getTime';
import { EMOJIS, EMOJIS_LENGTH } from '../../constants';
import { hashing } from '../../helpers';

type MessageProps = {
  message: DiscussionMessage;
  isAuthor: boolean;
};

const Message: FC<MessageProps> = ({ message, isAuthor }) => {
  return (
    <div className={clsx(styles.message, 'row')}>
      <TextIcon
        className={styles.forumTextIcon}
        char={EMOJIS[hashing(message.user, EMOJIS_LENGTH)]}
        size={30}
        fontSize={22}
        backgroundColor="transparent"
      />
      <span>
        <span className={clsx(styles.messageUsername, 'center-row')}>
          {`${message.user} · `}
          <span className={clsx(styles.messageText, 'caption')}>
            {getMMMDDYY(message.id)}
          </span>
        </span>
        <span className={styles.messageText}>{message.text}</span>
      </span>
    </div>
  );
};

type CourseCommentsProps = {
  courseId: string;
};

const CourseComments: FC<CourseCommentsProps> = ({ courseId }) => {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [page, setPage] = useState<number | null>(0);
  const user = useUser();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const view = useView();
  const onSubmit = async e => {
    const messageId = +new Date();
    e.preventDefault();
    setMessages(messages => [
      {
        user: user.data.username,
        text: messageInput,
        id: +new Date(),
      },
      ...messages,
    ]);
    setMessageInput('');
    try {
      await sendMessage({
        variables: {
          courseId,
          text: messageInput,
        },
      });
      view.setSnackBar('Comment posted!');
    } catch (e) {
      view.handleError(e);
      setMessages(items => items.filter(item => item._id !== messageId));
    }
  };

  const [fetchDiscussion, { loading: discussionLoading }] = useLazyQuery<
    any,
    {
      courseId: string;
      page?: number;
    }
  >(GET_DISCUSSIONS, {
    onError: view.handleError,
    onCompleted: data => {
      setMessages(items =>
        [...new Set(items.concat(data?.discussion?.messages || []))]
          .sort((a, b) => (a.id > b.id ? 1 : -1))
          .reverse()
      );
      setPage(data?.discussion?.nextPage);
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const loadMore = () => {
    if (page) {
      fetchDiscussion({
        variables: {
          courseId,
          page,
        },
      });
    }
  };
  useEffect(() => {
    if (courseId) {
      setMessages([]);
      setPage(0);
      fetchDiscussion({
        variables: {
          courseId,
          page: 0,
        },
      });
    }
  }, [courseId]);
  return (
    <>
      {!discussionLoading && (
        <span className="review-count caption center-row">
          {pluralize('comment', messages?.length, true)}
          <Divider />
        </span>
      )}
      {Boolean(messages?.length) && (
        <div
          ref={messagesContainerRef}
          className={clsx(styles.messagesContainer, 'card padding column')}
        >
          {messages.map(message => (
            <Message
              key={JSON.stringify(message)}
              message={message}
              isAuthor={user.data.username === message.user}
            />
          ))}
          {Boolean(page) && !discussionLoading && (
            <Button
              color="primary"
              onClick={() => loadMore()}
              className={clsx(styles.loadMoreBtn, 'capsule-btn')}
            >
              Load More
            </Button>
          )}
          {discussionLoading && <Loading />}
        </div>
      )}
      <div className={clsx(styles.messageInputContainer, 'card')}>
        <form onSubmit={onSubmit} className="center-row">
          <TextField
            value={messageInput}
            onChangeText={setMessageInput}
            placeholder="Your comment..."
          />
          <IconButton disabled={!messageInput} size="small" type="submit">
            <RiSendPlaneLine />
          </IconButton>
        </form>
      </div>
    </>
  );
};

export default observer(CourseComments);
