import { Button } from '@mui/material';
import { FC, ReactNode } from 'react';

import styles from '../../styles/components/planner/PlannerEmptyState.module.scss';

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

const PlannerEmptyState: FC<Props> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className={styles.emptyState}>
    <span className={styles.icon} aria-hidden="true">
      {icon}
    </span>
    <strong>{title}</strong>
    <p>{description}</p>
    {actionLabel && onAction && (
      <Button size="small" variant="outlined" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export default PlannerEmptyState;
