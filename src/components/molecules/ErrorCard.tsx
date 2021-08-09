import Card from '../atoms/Card';
import emptyPhoto from '../../images/undraw_empty_xct9.svg';
import errorPhoto from '../../images/undraw_server_down_s4lk.svg';
import notFoundPhoto from '../../images/404 Page Not Found _Monochromatic.svg';
import './ErrorCard.scss';
import { ErrorCardMode } from '../../types';

const CARD_ITEMS = {
  [ErrorCardMode.NULL]: {
    image: emptyPhoto,
    caption: 'Nothing here',
  },
  [ErrorCardMode.ERROR]: {
    image: errorPhoto,
    caption: 'Something is wrong here...',
  },
  [ErrorCardMode.NOT_FOUND]: {
    image: notFoundPhoto,
    caption: '404 Not Found...',
  },
};

type ErrorCardProps = {
  mode: ErrorCardMode;
  inPlace?: boolean;
};

const ErrorCard = ({ mode, inPlace }: ErrorCardProps) => (
  <Card inPlace className="null-card-container center column">
    <img
      src={CARD_ITEMS[mode]?.image}
      alt="Empty!"
      className="null-card-photo"
      draggable={false}
    />
    <span className="null-card-word caption">{CARD_ITEMS[mode]?.caption}</span>
  </Card>
);

export default ErrorCard;