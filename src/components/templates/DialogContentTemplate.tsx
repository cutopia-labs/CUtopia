import clsx from 'clsx';
import { FC } from 'react';

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
  <div className={clsx('contentContainer grid-auto-row', className)}>
    <div className="sub-title">{title}</div>
    <div className={clsx('dialogCaption caption')}>{caption}</div>
    {children}
  </div>
);

export default DialogContentTemplate;
