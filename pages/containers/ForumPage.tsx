import { observer } from 'mobx-react-lite';

import './ForumPage.scss';
import { Route, Switch } from 'react-router-dom';
import CoursePanel from '../components/forum/CoursePanel';
import Page from '../components/atoms/Page';
import HomePanel from '../components/forum/HomePanel';
import ReviewEditPanel from '../components/forum/ReviewEditPanel';

const ForumPage = () => (
  <Page className="forum-page" center padding>
    <Switch>
      <Route exact path="/review">
        <HomePanel />
      </Route>
      <Route strict exact path="/review/:id/compose">
        <ReviewEditPanel />
      </Route>
      <Route strict exact path={['/review/:id', '/review/:id/:reviewId']}>
        <CoursePanel />
      </Route>
    </Switch>
  </Page>
);

export default observer(ForumPage);
