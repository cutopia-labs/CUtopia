import '../../../styles/components/tabs/Tab.module.scss';
import Card from '../../atoms/Card';
import AboutSection from '../AboutSection';

const TermsOfUseTab = () => {
  return (
    <Card className="aboutCard">
      <AboutSection title="Terms" labelClassName="aboutTitle subHeading">
        <p>Drafting...</p>
      </AboutSection>
    </Card>
  );
};

export default TermsOfUseTab;
