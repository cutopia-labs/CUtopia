import './Card.scss';
import clsx from 'clsx';
import CardHeader from './CardHeader';

type CardOwnProps = {
  inPlace?: boolean;
  title?: string;
  titleContent?: JSX.Element;
};

export type CardProps = CardOwnProps & React.HTMLProps<HTMLDivElement>;

const Card = ({
  className,
  children,
  title,
  titleContent,
  inPlace,
  ...props
}: CardProps) => (
  <div className={clsx(inPlace ? 'column' : 'card', className)} {...props}>
    {Boolean(title) && <CardHeader title={title}>{titleContent}</CardHeader>}
    {children}
  </div>
);

export default Card;