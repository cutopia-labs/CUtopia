import clsx from 'clsx';
import { FC } from 'react';
import styles from '../../styles/components/molecules/Section.module.scss';

export type SectionProps = {
  title: string;
  className?: string;
  labelClassName?: string;
  subheading?: boolean;
};

const Section: FC<SectionProps> = ({
  title,
  children,
  className,
  labelClassName,
  subheading,
}) => (
  <div className={clsx(styles.sectionContainer, className)}>
    <div className={labelClassName || (subheading ? 'subHeading' : 'label')}>
      {title}
    </div>
    {children}
  </div>
);

export default Section;
