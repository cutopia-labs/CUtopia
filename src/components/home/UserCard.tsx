import { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Avatar from '@material-ui/core/Avatar';
import { SettingsOutlined } from '@material-ui/icons';
import { IconButton, Tooltip } from '@material-ui/core';
import { GoUnverified, GoVerified } from 'react-icons/go';

import './UserCard.scss';
import { ViewContext, PreferenceContext, UserContext } from '../../store';
import { User } from '../../types';
import { LEVEL_UP_EXP } from '../../constants/configs';

type UserCardProps = {
  userData: User;
};

const UserCard = ({ userData }: UserCardProps) => {
  const user = useContext(UserContext);
  const preference = useContext(PreferenceContext);
  const view = useContext(ViewContext);
  const [openSettings, SetOpenSetting] = useState(false);

  return (
    <div className="user-card card">
      <div className="user-card-header center-row">
        <Avatar className="char-icon">
          {user.data?.username?.charAt(0) || ''}
        </Avatar>
        <div className="user-card-header-details column">
          <div className="title center-row">
            {user.data?.username}
            <Tooltip
              title={
                user.data?.fullAccess
                  ? 'Full Access'
                  : 'Post 1 review to unlock full access for current semester'
              }
              placement="top"
              arrow
            >
              <span className="center-row">
                {user.data?.fullAccess ? <GoVerified /> : <GoUnverified />}
              </span>
            </Tooltip>
          </div>
          <Tooltip
            title={`${
              LEVEL_UP_EXP - (user.data?.exp % LEVEL_UP_EXP)
            } more exp to level up to Lv. ${user.level + 1}`}
            placement="bottom-start"
            arrow
          >
            <div className="caption">{`Contributor Lv. ${user.level}`}</div>
          </Tooltip>
        </div>
        <IconButton
          size="small"
          onClick={() =>
            view.setDialog({
              key: 'userSettings',
            })
          }
        >
          <SettingsOutlined />
        </IconButton>
      </div>
      <div className="user-about-card center-row">
        <div className="user-about-card-item column">
          <div className="sub-title">{userData?.reviewIds?.length || 0}</div>
          <div className="light-caption">Reviews</div>
        </div>
        <div className="user-about-card-item column">
          <div className="sub-title">{userData?.upvotes || 0}</div>
          <div className="light-caption">Upvotes</div>
        </div>
      </div>
    </div>
  );
};

export default observer(UserCard);
