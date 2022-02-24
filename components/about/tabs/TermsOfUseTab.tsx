import './Tab.scss';
import Card from '../../atoms/Card';
import AboutSection from '../AboutSection';

const TermsOfUseTab = () => {
  return (
    <Card className="about-card">
      <AboutSection title="Terms" labelClassName="about-title sub-heading">
        <p>Drafting...</p>
      </AboutSection>
    </Card>
  );
};

export default TermsOfUseTab;
