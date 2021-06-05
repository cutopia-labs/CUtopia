import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { useQuery } from '@apollo/client';

import './HomePage.css';
import { UserContext } from '../store';
import MyCourseList from '../components/home/MyCourseList';
import MyReviewList from '../components/home/MyReviewList';
import TimeTablePanel from '../components/TimeTablePanel';
import { MY_TIMETABLE_QUERY, GET_USER } from '../constants/queries';

const HomePage = () => {
  const user = useContext(UserContext);

  const { loading: timetableLoading } = useQuery(MY_TIMETABLE_QUERY, {
    variables: {
      username: user.cutopiaUsername,
    },
    onCompleted: (data) => {
      user.saveTimeTable(data.user.timetable);
    },
    skip: user.timetable.length !== 0,
  });

  const { loading: reviewsLoading } = useQuery(GET_USER, {
    variables: {
      username: user.cutopiaUsername,
    },
    onCompleted: (data) => {
      user.saveReviews(data.user);
    },
    skip: !user.reviews,
  });

  return (
    <div className="page row">
      <div className="column">
        <MyCourseList loading={timetableLoading} courses={user.timetable} />
        <MyReviewList loading={reviewsLoading} reviews={user.reviews} />
      </div>
      <TimeTablePanel
        title='Timetable'
        courses={user.timetable}
        onImport={(parsedData) => user.setAndSaveTimeTable(parsedData)}
        onClear={() => user.clearTimeTable()}
      />
    </div>
  );
};

export default observer(HomePage);
