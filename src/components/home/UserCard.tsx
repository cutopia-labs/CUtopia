import { observer } from 'mobx-react-lite';
import Avatar from '@material-ui/core/Avatar';
import { SettingsOutlined } from '@material-ui/icons';
import { IconButton, Tooltip } from '@material-ui/core';
import { GoUnverified, GoVerified } from 'react-icons/go';

import clsx from 'clsx';
import { FC } from 'react';
import styles from '../../styles/components/home/UserCard.module.scss';
import { useUser, useView } from '../../store';
import { User } from '../../types';
import { LEVEL_UP_EXP } from '../../constants/configs';

type UserCardProps = {
  userData: User;
};

const UserCard: FC<UserCardProps> = ({ userData }) => {
  const user = useUser();
  const view = useView();

  return (
    <div className={clsx(styles.userCard, 'card')}>
      <div className={clsx(styles.userCardHeader, 'center-row')}>
        <Avatar className={styles.charIcon}>
          {user.data?.username?.charAt(0) || ''}
        </Avatar>
        <div className={clsx(styles.userCardHeaderDetails, 'column')}>
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
      <div className={clsx(styles.userAboutCard, 'center-row')}>
        <div className={clsx(styles.userAboutCardItem, 'column')}>
          <div className="sub-title">{userData?.reviewIds?.length || 0}</div>
          <div className="light-caption">Reviews</div>
        </div>
        <div className={clsx(styles.userAboutCardItem, 'column')}>
          <div className="sub-title">{userData?.upvotes || 0}</div>
          <div className="light-caption">Upvotes</div>
        </div>
      </div>
    </div>
  );
};

export default observer(UserCard);
