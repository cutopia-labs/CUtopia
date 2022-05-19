import clsx from 'clsx';
import { PropsWithChildren } from 'react';
import styles from '../../styles/components/templates/DialogContentTemplate.module.scss';

type DialogContentTemplateProps = {
  className?: string;
  title?: string;
  caption?: string;
};

const DialogContentTemplate = ({
  className,
  children,
  title,
  caption,
}: PropsWithChildren<DialogContentTemplateProps>) => (
  <div className={clsx(styles.contentContainer, 'grid-auto-row', className)}>
    <div className="sub-title">{title}</div>
    <div className={clsx(styles.dialogCaption, 'caption')}>{caption}</div>
    {children}
  </div>
);

export default DialogContentTemplate;
