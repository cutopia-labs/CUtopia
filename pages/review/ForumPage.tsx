import { observer } from 'mobx-react-lite';

import '../styles/pages/ForumPage.module.scss';
import CoursePanel from '../components/review/CoursePanel';
import Page from '../components/atoms/Page';
import HomePanel from '../components/review/HomePanel';
import ReviewEditPanel from '../components/review/ReviewEditPanel';

const ForumPage = () => (
  <Page className="review-page" center padding>
    <HomePanel />
    <ReviewEditPanel />
    <CoursePanel />
  </Page>
);

export default observer(ForumPage);
