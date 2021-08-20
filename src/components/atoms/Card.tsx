import { PropsWithChildren } from 'react';

import './Card.scss';
import clsx from 'clsx';

type CardOwnProps = {
  inPlace?: boolean;
  title?: string;
  titleContent?: JSX.Element;
};

export type CardProps = PropsWithChildren<
  CardOwnProps & React.HTMLProps<HTMLDivElement>
>;

const Card = ({
  className,
  children,
  title,
  titleContent,
  inPlace,
  ...props
}: CardProps) => (
  <div className={clsx(inPlace ? 'column' : 'card', className)} {...props}>
    {Boolean(title) && (
      <header className="card-header">
        <h4>{title}</h4>
        {titleContent}
      </header>
    )}
    {children}
  </div>
);

export default Card;
