import { Box, Grid, makeStyles, Typography } from '@material-ui/core';

import Logo from '../components/atoms/Logo';
import LoginPanel from '../components/user/LoginPanel';
import Discusssing from '../images/talk.png';

const useBannerStyles = makeStyles((theme) => ({
  bannerTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
}));

const IntroBanner = ({ title, text }) => {
  const classes = useBannerStyles();

  return (
    <Box mt={5}>
      <Typography variant="h6" className={classes.bannerTitle}>
        {title}
      </Typography>
      <Typography variant="subtitle1">{text}</Typography>
    </Box>
  );
};

const useStyles = makeStyles((theme) => ({
  loginPage: {
    display: 'flex',
    backgroundColor: 'var(--surface)',
    width: '100vw',
    height: '100vh',
  },
  bannerPanel: {
    color: 'white',
    background:
      'linear-gradient(195deg, var(--primary) 2.3%,rgba(220, 86, 227,1) 88.5%)',
    padding: '42px',
    height: '100%',
  },
  loginPanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100vh',
  },
  slogan: {
    marginTop: '100px',
    fontWeight: 'bold',
  },
  bannerImage: {
    marginTop: '48px',
    width: '100%',
  },
}));

const LoginPage = () => {
  const classes = useStyles();

  return (
    <Grid container className={classes.loginPage}>
      <Grid item className={classes.bannerPanel} xs={12} sm={3}>
        <Logo />
        <Typography variant="h4" className={classes.slogan}>
          Grow together.
        </Typography>
        <IntroBanner
          title="Comment on courses"
          text="Read and write course reviews"
        />
        <IntroBanner
          title="Plan your timetable"
          text="Plan courses with our planner"
        />
        <IntroBanner
          title="Sign up with your SID"
          text="Contribute to read more comments"
        />
        <img className={classes.bannerImage} src={Discusssing} alt="" />
      </Grid>
      <Grid item className={classes.loginPanel} xs={12} sm={9}>
        <LoginPanel />
      </Grid>
    </Grid>
  );
};

export default LoginPage;
