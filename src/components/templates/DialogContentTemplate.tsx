import clsx from 'clsx';
import { FC } from 'react';
import styles from '../../styles/components/templates/DialogContentTemplate.module.scss';

type DialogContentTemplateProps = {
  className?: string;
  title?: string;
  caption?: string;
};

const DialogContentTemplate: FC<DialogContentTemplateProps> = ({
  className,
  children,
  title,
  caption,
}) => (
  <div className={clsx(styles.contentContainer, 'grid-auto-row', className)}>
    <div className="sub-title">{title}</div>
    <div className={clsx(styles.dialogCaption, 'caption')}>{caption}</div>
    {children}
  </div>
);

export default DialogContentTemplate;
