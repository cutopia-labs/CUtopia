import React, { useContext, useState } from 'react';
import { Box, Grid, makeStyles, Typography } from '@material-ui/core';
import {
  ChatBubbleOutlineOutlined,
  SchoolOutlined,
  NoteOutlined,
  CalendarTodayOutlined,
} from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import { useQuery } from '@apollo/client';
import { FiExternalLink } from 'react-icons/fi';

import UserCard from '../components/home/UserCard';
import { UserContext } from '../store';
import { CoursesList, ReviewsList } from '../components/home/HomePageTabs';
import TimeTablePanel from '../components/TimeTablePanel';
import { MY_TIMETABLE_QUERY, GET_USER } from '../constants/queries';
import TabsContainer from '../components/TabsContainer';
import Page from '../components/Page';
import Card from '../components/Card';

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

const useLinksCardStyles = makeStyles((theme) => ({
  linksCard: {
    padding: 'var(--card-padding)',
  },
  linkContainer: {
    'fontSize': '14px',
    'marginTop': '6px',
    '&:hover': {
      color: 'var(--primary)',
    },
    '& svg': {
      marginRight: '6px',
    },
  },
}));

const LinksCard = () => {
  const classes = useLinksCardStyles();

  return (
    <Card className={classes.linksCard}>
      <Typography gutterBottom>Links</Typography>
      {LINKS.map((link) => (
        <Box className={classes.linkContainer} key={link.url}>
          <FiExternalLink />
          <a href={link.url} target="_blank" rel="noreferrer">
            {link.name}
          </a>
        </Box>
      ))}
    </Card>
  );
};

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

const useStyles = makeStyles((theme) => ({
  leftPanels: {
    position: 'sticky',
    top: '0px',
  },
}));

const HomePage = () => {
  const classes = useStyles();

  const user = useContext(UserContext);
  const [tab, setTab] = useState('Courses');

  const { loading: timetableLoading } = useQuery(MY_TIMETABLE_QUERY, {
    variables: {
      username: user.cutopiaUsername,
    },
    onCompleted: (data) => {
      user.saveTimeTable(data.user.timetable);
    },
  });

  const { data: userData, loading: userDataLoading } = useQuery(GET_USER, {
    variables: {
      username: user.cutopiaUsername,
    },
    onCompleted: (data) => {
      user.saveReviews(data.user);
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
        return (
          <TimeTablePanel
            className="home-page-timetable"
            title="Planner"
            courses={user.plannerCourses}
            onImport={(parsedData) => user.setAndSaveTimeTable(parsedData)}
            onClear={() => user.clearTimeTable()}
          />
        );
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
    <Page>
      <Grid container spacing={2}>
        <Grid item className={classes.leftPanels} xs={12} sm={3}>
          {!userDataLoading && <UserCard userData={userData.user} />}
          <LinksCard />
        </Grid>
        <Grid item xs={12} sm={9}>
          <TabsContainer tabs={SELECTIONS} selected={tab} onSelect={setTab}>
            {renderTab()}
          </TabsContainer>
        </Grid>
      </Grid>
    </Page>
  );
};

export default observer(HomePage);
