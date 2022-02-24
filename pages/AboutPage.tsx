import {
  InfoOutlined,
  LockOutlined,
  DescriptionOutlined,
} from '@material-ui/icons';

import '../styles/pages/AboutPage.module.scss';
import { useRouter } from 'next/router';
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

const AboutPage = () => {
  const router = useRouter();

  const renderTab = () => {
    console.log(router.pathname);
    switch (router?.pathname.slice(1)) {
      case 'about':
        return <AboutTab />;
      case 'privacy':
        return <PrivacyTab />;
      case 'terms':
        return <TermsOfUseTab />;
    }
  };

  return (
    <Page className="about-page" center padding>
      <div className="grid-auto-row">
        <TabsContainer
          items={ABOUT_PAGE_ROUTES}
          selected={router.pathname.slice(1)}
          onSelect={label => router.push(`/${label}`)}
        />
        {renderTab()}
      </div>
    </Page>
  );
};

export default AboutPage;
