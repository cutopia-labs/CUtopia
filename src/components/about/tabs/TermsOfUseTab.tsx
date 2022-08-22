import clsx from 'clsx';
import { FC } from 'react';

import styles from '../../../styles/components/about/About.module.scss';
import Card from '../../atoms/Card';
import AboutSection from '../AboutSection';

const TermsOfUseTab: FC = () => {
  return (
    <Card className={styles.aboutCard}>
      <AboutSection
        title="Terms"
        labelClassName={clsx(styles.aboutTitle, 'subHeading')}
      >
        <p>Drafting...</p>
      </AboutSection>
    </Card>
  );
};

export default TermsOfUseTab;
