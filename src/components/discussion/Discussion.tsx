import { useContext, useState, useRef, useEffect } from 'react';

import './Discussion.scss';
import { Button, IconButton } from '@material-ui/core';
import { RiSendPlaneLine } from 'react-icons/ri';
import { useMutation, useQuery } from '@apollo/client';
import { DiscussionMessage } from '../../types';

import { UserContext, ViewContext } from '../../store';
import TextField from '../atoms/TextField';
import TextIcon from '../atoms/TextIcon';
import { GET_DISCUSSIONS } from '../../constants/queries';
import { SEND_MESSAGE } from '../../constants/mutations';
import Loading from '../atoms/Loading';
import { getMMMDDYY } from '../../helpers/getTime';
import { MESSAGES_PER_PAGE } from '../../constants/configs';

const MOCK_DISCUSSIONS = [
  {
    text: 'Hi there',
    user: 'kami',
    _id: 1233453456,
  },
  {
    text: 'Hi',
    user: 'Ryan',
    _id: 1233453456,
  },
  {
    text: 'Bye',
    user: 'kami',
    _id: 1233453456,
  },
  {
    text: 'Are there any testing resourses?',
    user: 'kami',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !!',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !!!',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !!',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !!!',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !!',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !!!',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !!',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !!',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !!!',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !!!',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !!',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Dun reg this shit !!!',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'Bye',
    user: 'mike',
    _id: 1233453456,
  },
  {
    text: 'GG',
    user: 'kami',
    _id: 1233453456,
  },
  {
    text: 'Bye asndf nsjdkf nkjasdnf jasndfkj nasdkjfn ajksdfn kjasdnf jkansdkjfn asjkdnf kjasdnf kjasnfkl jasndfjk nasdjkf nasdkjfn',
    user: 'kami',
    _id: 1233453456,
  },
];

type MessageProps = {
  message: DiscussionMessage;
  isAuthor: Boolean;
};

type DiscussionProps = {
  courseId: string;
};

export const Message = ({ message, isAuthor }: MessageProps) => {
  return (
    <div className="message row">
      <TextIcon text={message.user} size={32} />
      <span>
        <span className="message-username center-row">
          {`${message.user} · `}
          <span className="message-text caption">{getMMMDDYY(message.id)}</span>
        </span>
        <span className="message-text">{message.text}</span>
      </span>
    </div>
  );
};

const Discussion = ({ courseId }: DiscussionProps) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [page, setPage] = useState(0);
  const user = useContext(UserContext);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const view = useContext(ViewContext);
  const onSubmit = (e) => {
    const messageId = +new Date();
    e.preventDefault();
    setMessages((messages) => [
      ...messages,
      {
        user: user.data.username,
        text: messageInput,
        id: +new Date(),
      },
    ]);
    setMessageInput('');
    try {
      sendMessage({
        variables: {
          courseId,
          text: messageInput,
        },
      });
    } catch (e) {
      view.handleError(e);
      setMessages((items) => items.filter((item) => item._id !== messageId));
    }
  };
  const { loading: discussionLoading, refetch: fetchDiscussion } = useQuery<
    any,
    {
      courseId: string;
      page?: number;
    }
  >(GET_DISCUSSIONS, {
    variables: {
      courseId,
    },
    onError: view.handleError,
    onCompleted: (data) => {
      console.log(`Fetched ${data}`);
      setMessages((items) => items.concat(data?.discussion?.messages));
      setPage(data?.discussion?.nextPage);
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });
  const [
    sendMessage,
    { loading: sendMessageLoading, error: sendMessageError },
  ] = useMutation(SEND_MESSAGE, {
    onError: (e) => {
      view.handleError(e);
      // remove the sended message here
    },
  });
  const loadMore = async () => {
    console.log(`Loading ${page}`);
    if (page) {
      console.log('Fetching');
      console.log({
        courseId,
        page,
      });
      await fetchDiscussion({
        courseId,
        page,
      });
    }
  };
  useEffect(() => {
    if (!page && messages?.length < MESSAGES_PER_PAGE) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
      });
    }
  }, [messages?.length, page]);
  return (
    <div className="discussion-container">
      <div ref={messagesContainerRef} className="messages-container column">
        {Boolean(page) && !discussionLoading && (
          <Button
            color="primary"
            onClick={() => loadMore()}
            className="load-more-btn capsule-btn"
          >
            Load More
          </Button>
        )}
        {discussionLoading && <Loading />}
        {messages.map((message) => (
          <Message
            key={JSON.stringify(message)}
            message={message}
            isAuthor={user.data.username === message.user}
          />
        ))}
      </div>
      <form onSubmit={onSubmit} className="message-input-container center-row">
        <TextField
          value={messageInput}
          onChangeText={setMessageInput}
          placeholder="Write message..."
        />
        <IconButton disabled={!messageInput} size="small" type="submit">
          <RiSendPlaneLine />
        </IconButton>
      </form>
    </div>
  );
};

export default Discussion;
