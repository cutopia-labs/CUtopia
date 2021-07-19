import { observer } from 'mobx-react-lite';

import './ForumPage.scss';
import { CoursePanel, SearchPanel } from '../components/forum';
import Page from '../components/atoms/Page';

const ForumPage = () => (
  <Page className="forum-page" center padding>
    <SearchPanel />
    <CoursePanel />
  </Page>
);

export default observer(ForumPage);
