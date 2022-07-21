import { FC, useState } from 'react';
import { Typography } from '@material-ui/core';
import {
  ChatBubbleOutlineOutlined,
  SchoolOutlined,
  NoteOutlined,
} from '@material-ui/icons';
import { observer } from 'mobx-react-lite';

import { useTitle } from 'react-use';
import clsx from 'clsx';
import styles from '../styles/pages/HomePage.module.scss';
import UserCard from '../components/home/UserCard';
import { useUser, usePlanner } from '../store';
import { CoursesList, ReviewsList } from '../components/home/HomePageTabs';
import TabsContainer from '../components/molecules/TabsContainer';
import Page from '../components/atoms/Page';
import Card from '../components/atoms/Card';
import Link from '../components/molecules/Link';
import PlannerTimetable from '../components/planner/PlannerTimetable';
import Footer from '../components/molecules/Footer';
import useMobileQuery from '../hooks/useMobileQuery';
import authenticatedRoute from '../components/molecules/authenticatedRoute';

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

const LinksCard: FC = () => (
  <Card className={styles.linksCard}>
    <Typography>Links</Typography>
    {LINKS.map(link => (
      <Link
        style={styles.homeLinkContainer}
        url={link.url}
        label={link.name}
        key={link.url}
      />
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

const HomePage: FC = () => {
  useTitle('CUtopia');
  const user = useUser();
  const planner = usePlanner();
  const [tab, setTab] = useState('Courses');
  const isMobile = useMobileQuery();

  const renderTab = () => {
    switch (tab) {
      case 'Courses':
        return <CoursesList loading={false} courses={planner.plannerCourses} />;
      case 'Reviews':
        return <ReviewsList reviewIds={user.data?.reviewIds} />;
      case 'Planner':
        return <PlannerTimetable className={styles.homePageTimetable} />;
      default:
        return null;
    }
  };

  return (
    <Page className={styles.homePage} center padding>
      <div className={clsx(styles.homePageLeft, 'grid-auto-row')}>
        <UserCard userData={user.data} />
        <LinksCard />
        {!isMobile && <Footer />}
      </div>
      <div className={clsx(styles.homePageRight, 'grid-auto-row')}>
        <TabsContainer items={SELECTIONS} selected={tab} onSelect={setTab} />
        {renderTab()}
        {isMobile && <Footer />}
      </div>
    </Page>
  );
};

export default authenticatedRoute(observer(HomePage));
