import clsx from 'clsx';
import styles from '../../styles/components/molecules/Section.module.scss';
import { FCC } from '../../types/general';

export type SectionProps = {
  title: string;
  className?: string;
  labelClassName?: string;
  subheading?: boolean;
};

const Section: FCC<SectionProps> = ({
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
