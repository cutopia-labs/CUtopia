import { useContext, useState } from 'react';
import { Typography } from '@material-ui/core';
import {
  ChatBubbleOutlineOutlined,
  SchoolOutlined,
  NoteOutlined,
  CalendarTodayOutlined,
} from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import { useQuery } from '@apollo/client';

import './HomePage.scss';
import UserCard from '../components/home/UserCard';
import { PlannerContext, UserContext } from '../store';
import { CoursesList, ReviewsList } from '../components/home/HomePageTabs';
import TimeTablePanel from '../components/templates/TimeTablePanel';
import { MY_TIMETABLE_QUERY, GET_USER } from '../constants/queries';
import TabsContainer from '../components/molecules/TabsContainer';
import Page from '../components/atoms/Page';
import Card from '../components/atoms/Card';
import Link from '../components/molecules/Link';
import PlannerTimeTable from '../components/planner/PlannerTimeTable';

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
  <Card className="links-card">
    <Typography gutterBottom>Links</Typography>
    {LINKS.map((link) => (
      <Link url={link.url} label={link.name} key={link.url} />
    ))}
  </Card>
);

const SELECTIONS = [
  {
    label: 'Courses',
    icon: <SchoolOutlined />,
  },
  {
    label: 'Reviews',
    icon: <ChatBubbleOutlineOutlined />,
  },
  {
    label: 'Planner',
    icon: <NoteOutlined />,
  },
  {
    label: 'Timetable',
    icon: <CalendarTodayOutlined />,
  },
];

const HomePage = () => {
  const user = useContext(UserContext);
  const planner = useContext(PlannerContext);
  const [tab, setTab] = useState('Courses');

  const { loading: timetableLoading } = useQuery(MY_TIMETABLE_QUERY, {
    variables: {
      username: user.cutopiaUsername,
    },
    onCompleted: (data) => {
      user.saveTimeTable(data?.user?.timetable);
    },
  });

  const { data: userData, loading: userDataLoading } = useQuery(GET_USER, {
    variables: {
      username: user.cutopiaUsername,
    },
    onCompleted: (data) => {
      user.saveUser(data?.user);
    },
  });

  const renderTab = () => {
    switch (tab) {
      case 'Courses':
        return <CoursesList loading={false} courses={user.favoriteCourses} />;
      case 'Reviews':
        return (
          <ReviewsList
            loading={userDataLoading}
            reviewIds={userData?.user?.reviewIds}
          />
        );
      case 'Planner':
        return <PlannerTimeTable className="home-page-timetable" />;
      case 'Timetable':
        return (
          <TimeTablePanel
            className="home-page-timetable"
            title="Timetable"
            courses={user.timetable}
            onImport={(parsedData) => user.setAndSaveTimeTable(parsedData)}
            onClear={() => user.clearTimeTable()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Page className="home-page" center padding>
      <div className="home-page-left">
        {!userDataLoading && userData && <UserCard userData={userData?.user} />}
        <LinksCard />
      </div>
      <div className="home-page-right">
        <TabsContainer mb items={SELECTIONS} selected={tab} onSelect={setTab} />
        {renderTab()}
      </div>
    </Page>
  );
};

export default observer(HomePage);
