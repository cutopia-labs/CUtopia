import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useQuery } from '@apollo/client';
import { FiExternalLink } from 'react-icons/fi';
import {
  ChatBubbleOutlineOutlined, SchoolOutlined, NoteOutlined, CalendarTodayOutlined,
} from '@material-ui/icons';

import './HomePage.css';
import UserCard from '../components/home/UserCard';
import { UserContext } from '../store';
import { CoursesList, ReviewsList } from '../components/home/HomePageTabs';
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
        <div className="link-container center-row" key={link.url}>
          <FiExternalLink />
          <a href={link.url} target="_blank" rel="noreferrer">{link.name}</a>
        </div>
      ))
    }
  </div>
);

const MODES = {
  COURSES: 0,
  REVIEWS: 1,
  TIMETABLE: 2,
  PLANNER: 3,
};

const SELECTIONS = [
  {
    label: 'COURSES',
    icon: <SchoolOutlined />,
  },
  {
    label: 'REVIEWS',
    icon: <ChatBubbleOutlineOutlined />,
  },
  {
    label: 'PLANNER',
    icon: <NoteOutlined />,
  },
  {
    label: 'TIMETABLE',
    icon: <CalendarTodayOutlined />,
  },
];

const HomePage = () => {
  const user = useContext(UserContext);
  const [mode, setMode] = useState(MODES.COURSES);

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

  const CONTENTS = {
    COURSES: <CoursesList />,
    REVIEWS: 1,
    TIMETABLE: 2,
    PLANNER: 3,
  };

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
        <div className="home-page-right column">
          <div className="card bottom-border-row user-menu">
            {
              SELECTIONS.map(selection => (
                <div
                  key={selection.label}
                  className={`user-menu-item bottom-border-item center-row${MODES[selection.label] === mode ? ' active' : ''}`}
                  onClick={() => setMode(MODES[selection.label])}
                >
                  {selection.icon}
                  <span className="caption">{selection.label.toLowerCase()}</span>
                </div>
              ))
            }
          </div>
          {
            mode === MODES.COURSES
            && <CoursesList loading={false} courses={user.favoriteCourses} />
          }
          {
            mode === MODES.REVIEWS
            && <ReviewsList loading={userDataLoading} reviewIds={userData?.user?.reviewIds} />
          }
          {
            mode === MODES.PLANNER
            && (
              <TimeTablePanel
                className="home-page-timetable card"
                title="Planner"
                courses={user.plannerCourses}
                onImport={parsedData => user.setAndSaveTimeTable(parsedData)}
                onClear={() => user.clearTimeTable()}
              />
            )
          }
          {
            mode === MODES.TIMETABLE
            && (
              <TimeTablePanel
                className="home-page-timetable card"
                title="Timetable"
                courses={user.timetable}
                onImport={parsedData => user.setAndSaveTimeTable(parsedData)}
                onClear={() => user.clearTimeTable()}
              />
            )
          }
        </div>
      </div>
    </div>
  );
};

export default observer(HomePage);
