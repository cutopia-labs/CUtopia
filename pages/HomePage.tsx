import { useContext, useState } from 'react';
import { Typography } from '@material-ui/core';
import {
  ChatBubbleOutlineOutlined,
  SchoolOutlined,
  NoteOutlined,
} from '@material-ui/icons';
import { observer } from 'mobx-react-lite';

import '../styles/pages/HomePage.module.scss';
import { useTitle } from 'react-use';
import UserCard from '../components/home/UserCard';
import { PlannerContext, UserContext } from '../store';
import { CoursesList, ReviewsList } from '../components/home/HomePageTabs';
import TabsContainer from '../components/molecules/TabsContainer';
import Page from '../components/atoms/Page';
import Card from '../components/atoms/Card';
import Link from '../components/molecules/Link';
import PlannerTimetable from '../components/planner/PlannerTimetable';
import Footer from '../components/molecules/Footer';
import useMobileQuery from '../hooks/useMobileQuery';

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
    <Typography>Links</Typography>
    {LINKS.map(link => (
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
];

const HomePage = () => {
  useTitle('CUtopia');
  const user = useContext(UserContext);
  const planner = useContext(PlannerContext);
  const [tab, setTab] = useState('Courses');
  const isMobile = useMobileQuery();

  const renderTab = () => {
    switch (tab) {
      case 'Courses':
        return <CoursesList loading={false} courses={planner.plannerCourses} />;
      case 'Reviews':
        return <ReviewsList reviewIds={user.data?.reviewIds} />;
      case 'Planner':
        return <PlannerTimetable className="home-page-timetable" />;
      default:
        return null;
    }
  };

  return (
    <Page className="home-page" center padding>
      <div className="home-page-left grid-auto-row">
        <UserCard userData={user.data} />
        <LinksCard />
        {!isMobile && <Footer />}
      </div>
      <div className="home-page-right grid-auto-row">
        <TabsContainer items={SELECTIONS} selected={tab} onSelect={setTab} />
        {renderTab()}
        {isMobile && <Footer />}
      </div>
    </Page>
  );
};

export default observer(HomePage);
