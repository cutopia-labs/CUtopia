import clsx from 'clsx';
import { PropsWithChildren } from 'react';
import './Section.scss';

type SectionProps = {
  title: string;
  className?: string;
};

const Section = ({
  title,
  children,
  className,
}: PropsWithChildren<SectionProps>) => (
  <div className={clsx('section-container', className)}>
    <div className="label">{title}</div>
    {children}
  </div>
);

export default Section;
