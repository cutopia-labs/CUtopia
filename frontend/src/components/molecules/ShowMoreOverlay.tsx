import { ExpandMore } from '@mui/icons-material';
import clsx from 'clsx';
import { FC } from 'react';

import styles from '../../styles/components/molecules/ShowMoreOverlay.module.scss';
import If from '../atoms/If';

type ShowMoreOverlayProps = {
  visible: boolean;
  onShowMore: (...args: any[]) => any;
  style?: string;
};
const ShowMoreOverlay: FC<ShowMoreOverlayProps> = ({
  visible,
  onShowMore,
  style,
}) => (
  <If visible={visible}>
    <div className={clsx(styles.showMoreOverlay, style)} onClick={onShowMore}>
      <div className={clsx(styles.showMoreLabel, 'center-row')}>
        Show More
        <ExpandMore />
      </div>
    </div>
  </If>
);

export default ShowMoreOverlay;
