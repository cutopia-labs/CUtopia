import { Button } from '@mui/material';
import {
  ForumOutlined,
  LockOutlined,
  RateReviewOutlined,
} from '@mui/icons-material';
import clsx from 'clsx';
import { FC } from 'react';

import styles from '../../styles/components/review/ReviewAccessGate.module.scss';

type Props = {
  mode: 'reviews' | 'comments' | 'recent';
  onLogin: () => void;
};

const CONTENT = {
  reviews: {
    eyebrow: 'Verified CUHK access',
    title: 'Reviews stay within CUHK',
    caption:
      'Only verified CUHK students can read individual reviews, so students can share openly.',
    button: 'Log in to read reviews',
    icon: <RateReviewOutlined />,
  },
  comments: {
    eyebrow: 'Verified CUHK access',
    title: 'Discussion stays within CUHK',
    caption:
      'Course discussions stay within the verified CUHK student community.',
    button: 'Log in to read discussion',
    icon: <ForumOutlined />,
  },
  recent: {
    eyebrow: 'Verified CUHK access',
    title: 'Recent reviews stay within CUHK',
    caption:
      'Individual review text is visible only to verified CUHK students, so students can share candidly.',
    button: 'Log in to read recent reviews',
    icon: <ForumOutlined />,
  },
};

const ReviewAccessGate: FC<Props> = ({ mode, onLogin }) => {
  const content = CONTENT[mode];
  return (
    <section className={clsx(styles.accessGate, 'card')}>
      <div className={styles.preview} aria-hidden="true">
        {[0, 1].map(card => (
          <div className={styles.previewCard} key={card}>
            <div className={styles.previewHeader}>
              <span className={styles.previewAvatar} />
              <span className={styles.previewHeading} />
              <span className={styles.previewMeta} />
            </div>
            <div className={styles.previewRatings}>
              {[0, 1, 2, 3, 4].map(item => (
                <span key={item} />
              ))}
            </div>
            <span className={styles.previewLine} />
            <span
              className={clsx(styles.previewLine, styles.previewLineShort)}
            />
          </div>
        ))}
      </div>
      <div className={styles.fade} />
      <div className={styles.gateContent}>
        <div className={styles.iconContainer}>
          {content.icon}
          <span className={styles.lockBadge}>
            <LockOutlined />
          </span>
        </div>
        <span className={styles.eyebrow}>{content.eyebrow}</span>
        <h2>{content.title}</h2>
        <p>{content.caption}</p>
        <Button
          className={styles.loginButton}
          variant="contained"
          color="primary"
          onClick={onLogin}
        >
          {content.button}
        </Button>
        <span className={styles.accessNote}>
          CUHK student verification required
        </span>
      </div>
    </section>
  );
};

export default ReviewAccessGate;
