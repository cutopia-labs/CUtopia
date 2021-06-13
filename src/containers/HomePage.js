import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { useQuery } from '@apollo/client';
import { FiExternalLink } from 'react-icons/fi';

import './HomePage.css';
import UserCard from '../components/home/UserCard';
import { UserContext } from '../store';
import MyCourseList from '../components/home/MyCourseList';
import MyReviewList from '../components/home/MyReviewList';
import TimeTablePanel from '../components/TimeTablePanel';
import { MY_TIMETABLE_QUERY, GET_USER } from '../constants/queries';

const LINKS = [
  {
    name: 'CUSIS',
    url: 'https://cusis.cuhk.edu.hk/',
  },
  {
    name: 'Blackboard',
    url: 'https://blackboard.cuhk.edu.hk/',
  },
  {
    name: 'Curriculum Handbook',
    url: 'http://rgsntl.rgs.cuhk.edu.hk/aqs_prd_applx/Public/Handbook/Default.aspx?id=2&tv=T&lang=en',
  },
];

const LinksCard = () => (
  <div className="links-card card">
    <div className="sub-title">Links</div>
    {
      LINKS.map(link => (
        <div className="link-container center-row">
          <FiExternalLink />
          <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.name}</a>
        </div>
      ))
    }
  </div>
);

const HomePage = () => {
  const user = useContext(UserContext);

  const { loading: timetableLoading } = useQuery(MY_TIMETABLE_QUERY, {
    variables: {
      username: user.cutopiaUsername,
    },
    onCompleted: data => {
      user.saveTimeTable(data.user.timetable);
    },
  });

  const { data: userData, loading: userDataLoading } = useQuery(GET_USER, {
    variables: {
      username: user.cutopiaUsername,
    },
    onCompleted: data => {
      user.saveReviews(data.user);
    },
  });

  return (
    <div className="home-page page row">
      <div className="center-page row">
        <div className="home-page-left column">
          {
            !userDataLoading
          && <UserCard userData={userData.user} />
          }
          <LinksCard />
        </div>
      </div>
    </div>
  );
};

export default observer(HomePage);
