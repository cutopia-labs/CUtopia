import { FC } from 'react';
import Section, { SectionProps } from './Section';

type SectionTextProps = {
  caption: string;
};

const SectionText: FC<SectionProps & SectionTextProps> = props => (
  <Section {...props} subheading>
    <p className="caption">{props.caption}</p>
  </Section>
);

export default SectionText;
