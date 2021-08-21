import { useContext } from 'react';

import './Discussion.scss';
import { Avatar } from '@material-ui/core';
import { DiscussionMessage } from '../../types';

import { UserContext } from '../../store';
import Card from '../atoms/Card';
import colors from '../../constants/colors';
import { hashing } from '../../helpers';

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
        {message.user.charAt(0) || ''}
      </Avatar>
      <span>
        <span className="message-username">{message.user}</span>
        <span className="message-text caption">{message.text}</span>
      </span>
    </div>
  );
};

const Discussion = ({ courseId }) => {
  const user = useContext(UserContext);
  return (
    <Card title="Discussion" className="discussion-card">
      <div className="messages-container column">
        {MOCK_DISCUSSIONS.map((message) => (
          <Message
            key={JSON.stringify(message)}
            message={message}
            isAuthor={user.data.username === message.user}
          />
        ))}
      </div>
    </Card>
  );
};

export default Discussion;
