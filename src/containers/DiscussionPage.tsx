import Page from '../components/atoms/Page';
import DiscussionPanel from '../components/discussion/DiscussionPanel';
import './DiscussionPage.scss';

const DiscussionPage = () => {
  return (
    <Page className="discussion-page" center padding>
      <DiscussionPanel />
    </Page>
  );
};

export default DiscussionPage;
