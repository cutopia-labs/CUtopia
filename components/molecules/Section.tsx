import clsx from 'clsx';
import { PropsWithChildren } from 'react';
import styles from '../../styles/components/molecules/Section.module.scss';

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
  <div className={clsx(styles.sectionContainer, className)}>
    <div className={labelClassName || (subheading ? 'subHeading' : 'label')}>
      {title}
    </div>
    {children}
  </div>
);

export default Section;
