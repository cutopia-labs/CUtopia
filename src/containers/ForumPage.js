import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import './ForumPage.css';
import { CoursePanel, SearchPanel } from '../components/forum';
import { UserContext } from '../store';

const ForumPage = () => {
  const user = useContext(UserContext);

  return (
    <div className="page row">
      <SearchPanel />
      <CoursePanel />
    </div>
  );
};

export default observer(ForumPage);
