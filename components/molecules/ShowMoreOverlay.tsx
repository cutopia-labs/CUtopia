import { ExpandMore } from '@material-ui/icons';
import clsx from 'clsx';
import { FC } from 'react';

import styles from '../../styles/components/molecules/ShowMoreOverlay.module.scss';

type ShowMoreOverlayProps = {
  visible: boolean;
  onShowMore: (...args: any[]) => any;
  style?: string;
};
const ShowMoreOverlay: FC<ShowMoreOverlayProps> = ({
  visible,
  onShowMore,
  style,
}) => {
  if (visible) {
    return (
      <div className={clsx(styles.showMoreOverlay, style)} onClick={onShowMore}>
        <div className={clsx(styles.showMoreLabel, 'center-row')}>
          Show More
          <ExpandMore />
        </div>
      </div>
    );
  }

  return null;
};

export default ShowMoreOverlay;
