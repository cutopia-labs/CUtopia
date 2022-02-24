import { observer } from 'mobx-react-lite';

import '../styles/pages/ForumPage.module.scss';
import CoursePanel from '../components/forum/CoursePanel';
import Page from '../components/atoms/Page';
import HomePanel from '../components/forum/HomePanel';
import ReviewEditPanel from '../components/forum/ReviewEditPanel';

const ForumPage = () => (
  <Page className="forum-page" center padding>
    <HomePanel />
    <ReviewEditPanel />
    <CoursePanel />
  </Page>
);

export default observer(ForumPage);
