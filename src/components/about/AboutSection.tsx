import { FC, PropsWithChildren } from 'react';
import Section, { SectionProps } from '../molecules/Section';
import styles from '../../styles/components/about/About.module.scss';

const AboutSection: FC<PropsWithChildren<SectionProps>> = props => (
  <Section labelClassName={styles.aboutHeader} {...props} />
);

export default AboutSection;
