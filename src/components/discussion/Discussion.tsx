import { useContext, useState, useRef, useEffect } from 'react';

import './Discussion.scss';
import { IconButton } from '@material-ui/core';
import { RiSendPlaneLine } from 'react-icons/ri';
import { useMutation, useQuery } from '@apollo/client';
import { DiscussionMessage } from '../../types';

import { UserContext, ViewContext } from '../../store';
import TextField from '../atoms/TextField';
import TextIcon from '../atoms/TextIcon';
import { GET_DISCUSSIONS } from '../../constants/queries';
import { validCourse } from '../../helpers';
import { SEND_MESSAGE } from '../../constants/mutations';
import Loading from '../atoms/Loading';

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
      <TextIcon text={message.user} size={24} />
      <span>
        <span className="message-username">{message.user}</span>
        <span className="message-text caption">{message.text}</span>
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
        _id: +new Date(),
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
  const { loading: discussionLoading, refetch: fetchDiscussion } = useQuery(
    GET_DISCUSSIONS,
    {
      skip: !validCourse(courseId),
      variables: {
        courseId,
      },
      onError: view.handleError,
      onCompleted: (data) => {
        setMessages((items) => items.concat(data?.discussion?.messages));
        setPage(data?.discussion?.nextPage);
      },
    }
  );
  const [
    sendMessage,
    { loading: sendMessageLoading, error: sendMessageError },
  ] = useMutation(SEND_MESSAGE, {
    onError: (e) => {
      view.handleError(e);
      // remove the sended message here
    },
  });
  useEffect(() => {
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
    });
  }, [messages?.length]);
  return (
    <div className="discussion-container">
      <div ref={messagesContainerRef} className="messages-container column">
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
