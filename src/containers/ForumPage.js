import React from 'react';
import { observer } from 'mobx-react-lite';

import './ForumPage.css';
import { CoursePanel, SearchPanel } from '../components/forum';

const ForumPage = () => (
  <div className="forum-page center-page page row">
    <SearchPanel />
    <CoursePanel />
  </div>
);

export default observer(ForumPage);
