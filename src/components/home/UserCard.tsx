import { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Avatar from '@material-ui/core/Avatar';
import { SettingsOutlined } from '@material-ui/icons';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Switch,
  Divider,
  Tooltip,
} from '@material-ui/core';
import { GoVerified } from 'react-icons/go';

import './UserCard.scss';
import ListItem from '../molecules/ListItem';
import {
  NotificationContext,
  PreferenceContext,
  UserContext,
} from '../../store';
import { User } from '../../types';
import Card from '../atoms/Card';
import Loading from '../atoms/Loading';
import { clearStore } from '../../helpers/store';

type UserCardProps = {
  userData: User;
  loading: boolean;
};

const UserCard = ({ userData, loading }: UserCardProps) => {
  const user = useContext(UserContext);
  const preference = useContext(PreferenceContext);
  const notification = useContext(NotificationContext);
  const [openSettings, SetOpenSetting] = useState(false);

  if (loading) {
    return (
      <Card>
        <Loading />
      </Card>
    );
  }

  return (
    <div className="user-card card">
      <div className="user-card-header center-row">
        <Avatar className="char-icon">
          {user?.cutopiaUsername ? user?.cutopiaUsername?.charAt(0) : ''}
        </Avatar>
        <div className="user-card-header-details column">
          <div className="title center-row">
            {user?.cutopiaUsername}
            <Tooltip
              title={
                userData?.reviewIds?.length >= 3
                  ? 'Full Member'
                  : 'Post 3 reviews to be a full member!'
              }
              placement="top"
              arrow
            >
              <span className="center-row">
                <GoVerified />
              </span>
            </Tooltip>
          </div>
          <Tooltip
            title="3 reviews to go to upgrade to Lv. 2"
            placement="bottom-start"
            arrow
          >
            <div className="caption">Contributor Lv. 1</div>
          </Tooltip>
        </div>
        <IconButton size="small" onClick={() => SetOpenSetting(true)}>
          <SettingsOutlined />
        </IconButton>
      </div>
      <div className="user-about-card center-row">
        <div className="user-about-card-item column">
          <div className="sub-title">{userData?.reviewIds?.length || 0}</div>
          <div className="light-caption">Reviews</div>
        </div>
        <div className="user-about-card-item column">
          <div className="sub-title">{userData?.upvotesCount || 0}</div>
          <div className="light-caption">Upvotes</div>
        </div>
      </div>
      <Dialog
        className="settings-modal-container"
        open={openSettings}
        onClose={() => SetOpenSetting(false)}
      >
        <DialogTitle id="form-dialog-title">Settings</DialogTitle>
        <DialogContent className="settings-modal">
          <div className="toggle-row center-row">
            Dark Mode
            <Switch
              checked={preference.darkTheme}
              onChange={() => preference.setDarkTheme(!preference.darkTheme)}
              name="checkedA"
              inputProps={{ 'aria-label': 'secondary checkbox' }}
            />
          </div>
        </DialogContent>
        <ListItem
          noBorder
          className="log-out-row"
          onClick={() => {
            user.logout();
            clearStore();
          }}
        >
          <span className=" center-row">Reset</span>
        </ListItem>
        <Divider />
        <ListItem
          noBorder
          className="log-out-row"
          onClick={() => {
            user.logout();
            notification.setSnackBar('Successfully logged out!');
            SetOpenSetting(false);
          }}
        >
          <span className=" center-row">Log Out</span>
        </ListItem>
      </Dialog>
    </div>
  );
};

export default observer(UserCard);
