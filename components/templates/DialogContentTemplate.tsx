import clsx from 'clsx';
import { PropsWithChildren } from 'react';
import './DialogContentTemplate.scss';

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
  <div className={clsx('content-container grid-auto-row', className)}>
    <div className="sub-title">{title}</div>
    <div className="dialog-caption caption">{caption}</div>
    {children}
  </div>
);

export default DialogContentTemplate;
