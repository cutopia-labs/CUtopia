import clsx from 'clsx';
import { PropsWithChildren } from 'react';
import '../../styles/components/molecules/Section.scss';

export type SectionProps = {
  title: string;
  className?: string;
  labelClassName?: string;
  subheading?: boolean;
};

const Section = ({
  title,
  children,
  className,
  labelClassName,
  subheading,
}: PropsWithChildren<SectionProps>) => (
  <div className={clsx('section-container', className)}>
    <div className={labelClassName || (subheading ? 'sub-heading' : 'label')}>
      {title}
    </div>
    {children}
  </div>
);

export default Section;
