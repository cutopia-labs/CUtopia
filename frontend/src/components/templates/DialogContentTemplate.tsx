import clsx from 'clsx';
import { FCC } from '../../types/general';

type DialogContentTemplateProps = {
  className?: string;
  title?: string;
  caption?: string;
};

const DialogContentTemplate: FCC<DialogContentTemplateProps> = ({
  className,
  children,
  title,
  caption,
}) => (
  <div className={clsx('contentContainer grid-auto-row', className)}>
    <div className="sub-title">{title}</div>
    <div className="dialogCaption caption">{caption}</div>
    {children}
  </div>
);

export default DialogContentTemplate;
