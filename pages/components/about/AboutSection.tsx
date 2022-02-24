import { PropsWithChildren } from 'react';
import Section, { SectionProps } from '../molecules/Section';

const AboutSection = (props: PropsWithChildren<SectionProps>) => (
  <Section className="about-section" labelClassName="about-header" {...props} />
);

export default AboutSection;
