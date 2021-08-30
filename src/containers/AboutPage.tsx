import {
  History,
  InfoOutlined,
  LockOutlined,
  DescriptionOutlined,
} from '@material-ui/icons';

import './AboutPage.scss';
import { useHistory, useLocation } from 'react-router-dom';
import {
  AboutTab,
  ChangelogTab,
  PrivacyTab,
  TermsOfUseTab,
} from '../components/about/tabs';
import Page from '../components/atoms/Page';
import TabsContainer from '../components/molecules/TabsContainer';

export const ABOUT_PAGE_ROUTES = [
  {
    label: 'about',
    icon: <InfoOutlined />,
  },
  {
    label: 'changelog',
    icon: <History />,
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
  const history = useHistory();
  const location = useLocation();

  const renderTab = () => {
    console.log(location.pathname);
    switch (location?.pathname.slice(1)) {
      case 'about':
        return <AboutTab />;
      case 'changelog':
        return <ChangelogTab />;
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
          selected={location.pathname.slice(1)}
          onSelect={label => history.push(`/${label}`)}
        />
        {renderTab()}
      </div>
    </Page>
  );
};

export default AboutPage;
