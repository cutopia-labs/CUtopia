import clsx from 'clsx';
import { PropsWithChildren } from 'react';
import './Section.scss';

export type SectionProps = {
  title: string;
  className?: string;
  subheading?: boolean;
};

const Section = ({
  title,
  children,
  className,
  subheading,
}: PropsWithChildren<SectionProps>) => (
  <div className={clsx('section-container', className)}>
    <div className={subheading ? 'sub-heading' : 'label'}>{title}</div>
    {children}
  </div>
);

export default Section;
