import { useContext, useState, useRef, useEffect } from 'react';

import './Discussion.scss';
import { Avatar, IconButton } from '@material-ui/core';
import { RiSendPlaneLine } from 'react-icons/ri';
import { DiscussionMessage } from '../../types';

import { UserContext } from '../../store';
import Card from '../atoms/Card';
import colors from '../../constants/colors';
import { hashing } from '../../helpers';
import TextField from '../atoms/TextField';

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

const Message = ({ message, isAuthor }: MessageProps) => {
  return (
    <div className="message row">
      <Avatar
        style={{
          backgroundColor:
            colors.randomColors[
              hashing(message.user, colors.randomColorsLength)
            ],
        }}
        className="char-icon"
      >
        {message.user.charAt(0)}
      </Avatar>
      <span>
        <span className="message-username">{message.user}</span>
        <span className="message-text caption">{message.text}</span>
      </span>
    </div>
  );
};

const Discussion = ({ courseId }) => {
  const [messages, setMessages] = useState(MOCK_DISCUSSIONS);
  const [messageInput, setMessageInput] = useState('');
  const user = useContext(UserContext);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const onSubmit = (e) => {
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
  };
  useEffect(() => {
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
    });
  }, [messages?.length]);
  return (
    <Card title="Discussion" className="discussion-card">
      <div ref={messagesContainerRef} className="messages-container column">
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
    </Card>
  );
};

export default Discussion;
