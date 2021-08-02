import { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Avatar from '@material-ui/core/Avatar';
import { SettingsOutlined } from '@material-ui/icons';
import { IconButton, Tooltip } from '@material-ui/core';
import { GoUnverified, GoVerified } from 'react-icons/go';

import './UserCard.scss';
import { ViewContext, PreferenceContext, UserContext } from '../../store';
import { User } from '../../types';
import {
  FULL_MEMBER_EXP,
  LEVEL_UP_EXP,
  REVIEW_EXP,
} from '../../constants/configs';

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
          {user?.username ? user?.username?.charAt(0) : ''}
        </Avatar>
        <div className="user-card-header-details column">
          <div className="title center-row">
            {user?.username}
            <Tooltip
              title={
                user.isFullMember
                  ? 'Full Member'
                  : `${Math.ceil(
                      (FULL_MEMBER_EXP - user.data?.exp) / REVIEW_EXP
                    )} reviews to go to be a full member`
              }
              placement="top"
              arrow
            >
              <span className="center-row">
                {user.isFullMember ? <GoVerified /> : <GoUnverified />}
              </span>
            </Tooltip>
          </div>
          <Tooltip
            title={`${
              LEVEL_UP_EXP - (user.data?.exp % LEVEL_UP_EXP)
            } more exp to level up to Lv. ${user.data?.level + 1}`}
            placement="bottom-start"
            arrow
          >
            <div className="caption">{`Contributor Lv. ${user.data?.level}`}</div>
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
          <div className="sub-title">{userData?.upvotesCount || 0}</div>
          <div className="light-caption">Upvotes</div>
        </div>
      </div>
    </div>
  );
};

export default observer(UserCard);
