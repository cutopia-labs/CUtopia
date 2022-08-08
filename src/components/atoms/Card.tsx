import clsx from 'clsx';
import { forwardRef } from 'react';
import CardHeader from './CardHeader';

type CardOwnProps = {
  inPlace?: boolean;
  title?: string;
  titleContent?: JSX.Element;
};

export type CardProps = CardOwnProps & React.HTMLProps<HTMLDivElement>;

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, title, titleContent, inPlace, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(inPlace ? 'column' : 'card', className)}
      {...props}
    >
      {Boolean(title) && <CardHeader title={title}>{titleContent}</CardHeader>}
      {children}
    </div>
  )
);

export default Card;
