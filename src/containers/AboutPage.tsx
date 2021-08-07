import { useState } from 'react';
import { Info, History, Fingerprint, Description } from '@material-ui/icons';

import './AboutPage.scss';
import {
  AboutTab,
  ChangelogTab,
  PrivacyTab,
  TermsOfUseTab,
} from '../components/about/tabs';
import Page from '../components/atoms/Page';
import TabsContainer from '../components/molecules/TabsContainer';

const SELECTIONS = [
  {
    label: 'About',
    icon: <Info />,
  },
  {
    label: 'Changelog',
    icon: <History />,
  },
  {
    label: 'Privacy',
    icon: <Fingerprint />,
  },
  {
    label: 'Terms of Use',
    icon: <Description />,
  },
];

const AboutPage = () => {
  const [tab, setTab] = useState('About');

  const renderTab = () => {
    switch (tab) {
      case 'About':
        return <AboutTab />;
      case 'Changelog':
        return <ChangelogTab />;
      case 'Privacy':
        return <PrivacyTab />;
      case 'Terms of Use':
        return <TermsOfUseTab />;
    }
  };

  return (
    <Page className="about-page" center padding>
      <div className="about-page-center grid-auto-row">
        <TabsContainer items={SELECTIONS} selected={tab} onSelect={setTab} />
        {renderTab()}
      </div>
    </Page>
  );
};

export default AboutPage;
