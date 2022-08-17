import { ExpandMore } from '@material-ui/icons';
import clsx from 'clsx';
import { FC } from 'react';

import styles from '../../styles/components/molecules/ShowMoreOverlay.module.scss';
import ConditionView from '../atoms/ConditionView';

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
  <ConditionView visible={visible}>
    <div className={clsx(styles.showMoreOverlay, style)} onClick={onShowMore}>
      <div className={clsx(styles.showMoreLabel, 'center-row')}>
        Show More
        <ExpandMore />
      </div>
    </div>
  </ConditionView>
);

export default ShowMoreOverlay;
