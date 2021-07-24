import { observer } from 'mobx-react-lite';

import './ForumPage.scss';
import { Route } from 'react-router-dom';
import { CoursePanel, SearchPanel } from '../components/forum';
import Page from '../components/atoms/Page';
import HomePanel from '../components/forum/HomePanel';

const ForumPage = () => (
  <Page className="forum-page" center padding>
    <SearchPanel />
    <Route exact path="/review">
      <HomePanel />
    </Route>
    <Route
      exact
      path={['/review/:id', '/review/:id/compose', '/review/:id/:reviewId']}
    >
      <CoursePanel />
    </Route>
  </Page>
);

export default observer(ForumPage);
