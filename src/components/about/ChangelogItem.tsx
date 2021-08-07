import { ListItem, ListItemAvatar, ListItemText } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import './ChangelogItem.scss';
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
    <ListItem alignItems="flex-start" className="change-log">
      <ListItemAvatar>
        <Avatar alt={committer} src={avatar_url} />
      </ListItemAvatar>
      <ListItemText
        onClick={() => window.open(url)}
        primary={message.substring(
          0,
          message.indexOf('\n') + 1 || message.length
        )}
        secondary={`${committer} commited in ${date.substring(0, 10)}`}
      />
    </ListItem>
  );
};

export default Changelog;
