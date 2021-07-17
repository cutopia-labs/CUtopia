import { observer } from 'mobx-react-lite';

import { CoursePanel, SearchPanel } from '../components/forum';
import Page from '../components/Page';

const ForumPage = () => (
  <Page>
    <SearchPanel />
    <CoursePanel />
  </Page>
);

export default observer(ForumPage);
