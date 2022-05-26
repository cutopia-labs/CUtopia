import { FC } from 'react';
import clsx from 'clsx';
import Card from '../atoms/Card';
import styles from '../../styles/components/molecules/ErrorCard.module.scss';
import { ErrorCardMode } from '../../types';

const CARD_ITEMS = {
  [ErrorCardMode.NULL]: {
    image: '/images/undraw_empty_xct9.svg',
    caption: 'Nothing here...',
  },
  [ErrorCardMode.ERROR]: {
    image: '/images/undraw_server_down_s4lk.svg',
    caption: 'Something is wrong here...',
  },
  [ErrorCardMode.NOT_FOUND]: {
    image: '/images/404 Page Not Found _Monochromatic.svg',
    caption: '404 Not Found...',
  },
};

type ErrorCardProps = {
  mode: ErrorCardMode;
  inPlace?: boolean;
  caption?: string;
};

const ErrorCard: FC<ErrorCardProps> = ({ mode, inPlace = true, caption }) => (
  <Card
    inPlace={inPlace}
    className={clsx(styles.errorCardContainer, 'center column')}
  >
    <img
      src={CARD_ITEMS[mode]?.image}
      alt="Empty!"
      draggable={false}
      width="100%"
      height="100%"
    />
    <span className="caption">{caption || CARD_ITEMS[mode]?.caption}</span>
  </Card>
);

export default ErrorCard;
