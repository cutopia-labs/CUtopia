import {
  InfoOutlined,
  LockOutlined,
  DescriptionOutlined,
} from '@material-ui/icons';

import { FC, useState } from 'react';
import clsx from 'clsx';
import styles from '../styles/pages/AboutPage.module.scss';
import { AboutTab, PrivacyTab, TermsOfUseTab } from '../components/about/tabs';
import Page from '../components/atoms/Page';
import TabsContainer from '../components/molecules/TabsContainer';

export const ABOUT_PAGE_ROUTES = [
  {
    label: 'about',
    icon: <InfoOutlined />,
  },
  {
    label: 'privacy',
    icon: <LockOutlined />,
  },
  {
    label: 'terms',
    icon: <DescriptionOutlined />,
  },
];

const AboutPage: FC = () => {
  const [tab, setTab] = useState('about');
  const renderTab = () => {
    switch (tab) {
      case 'about':
        return <AboutTab />;
      case 'privacy':
        return <PrivacyTab />;
      case 'terms':
        return <TermsOfUseTab />;
    }
  };

  return (
    <Page className={styles.aboutPage} center padding>
      <div className={clsx(styles.content, 'grid-auto-row')}>
        <TabsContainer
          items={ABOUT_PAGE_ROUTES}
          selected={tab}
          onSelect={label => setTab(label)}
        />
        {renderTab()}
      </div>
    </Page>
  );
};

export default AboutPage;
