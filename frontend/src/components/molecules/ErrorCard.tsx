import { FC } from 'react';
import clsx from 'clsx';
import Card from '../atoms/Card';
import styles from '../../styles/components/molecules/ErrorCard.module.scss';
import { ErrorCardMode } from '../../types';

const CARD_ITEMS = {
  [ErrorCardMode.NULL]: {
    image: '/images/null.svg',
    caption: 'Nothing here...',
  },
  [ErrorCardMode.ERROR]: {
    image: '/images/error.svg',
    caption: 'Something is wrong here...',
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
