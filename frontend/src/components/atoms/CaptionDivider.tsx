import { Divider } from '@mui/material';
import clsx from 'clsx';
import { FCC } from '../../types/general';
import styles from '../../styles/components/atoms/CaptionDivider.module.scss';

type Props = {
  className?: string;
};

const CaptionDivider: FCC<Props> = ({ children, className }) => (
  <span
    className={clsx('center-row caption', styles.captionDivider, className)}
  >
    {children}
    <Divider />
  </span>
);

export default CaptionDivider;
