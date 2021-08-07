import Section, { SectionProps } from './Section';

type SectionTextProps = {
  caption: string;
};

const SectionText = (props: SectionProps & SectionTextProps) => (
  <Section {...props} subheading>
    <p className="caption">{props.caption}</p>
  </Section>
);

export default SectionText;
