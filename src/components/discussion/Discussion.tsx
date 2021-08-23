import { useContext, useState, useRef, useEffect } from 'react';

import './Discussion.scss';
import { IconButton } from '@material-ui/core';
import { RiSendPlaneLine } from 'react-icons/ri';
import { DiscussionMessage } from '../../types';

import { UserContext } from '../../store';
import TextField from '../atoms/TextField';
import TextIcon from '../atoms/TextIcon';

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
    <div className="discussion-container">
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
    </div>
  );
};

export default Discussion;
