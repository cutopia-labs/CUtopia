import { ListItem, ListItemAvatar, ListItemText } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';

import Link from '../molecules/Link';

type ChangelogProps = {
  committer: string;
  message: string;
  url: string;
  date: string;
  avatar_url: string;
};

const Changelog = ({
  committer,
  message,
  url,
  date,
  avatar_url,
}: ChangelogProps) => {
  return (
    <div>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar alt={committer} src={avatar_url} />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Link url={url} label={message} truncate={250} icon={false} />
          }
          secondary={`${committer} commited in ${date.substring(0, 10)}`}
        />
      </ListItem>
    </div>
  );
};

export default Changelog;
