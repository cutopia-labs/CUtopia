import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  logoContainer: {
    fontFamily: 'Futura, sans-serif',
    fontWeight: 900,
    fontSize: '22px',
    letterSpacing: '2px',
    floatDistance: '6px',
    cursor: 'default',
  },
}));

const Logo = () => {
  const classes = useStyles();

  return <div className={classes.logoContainer}>cutopia</div>;
};

export default Logo;
