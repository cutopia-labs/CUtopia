import { PropsWithChildren } from 'react';

import './Card.scss';
import clsx from 'clsx';

type CardProps = {
  inPlace?: boolean;
  title?: string;
  titleContent?: JSX.Element;
};

const Card = ({
  className,
  children,
  title,
  titleContent,
  inPlace,
  ...props
}: PropsWithChildren<CardProps & React.HTMLProps<HTMLDivElement>>) => (
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
