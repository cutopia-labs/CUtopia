import { PropsWithChildren } from 'react';
import { Box, BoxProps, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    padding: 30,
    bgcolor: 'rgb(250, 249, 248, 1)',
    [theme.breakpoints.up('lg')]: {
      paddingLeft: 300,
      paddingRight: 300,
    },
  },
}));

const Page = ({ children, ...props }: PropsWithChildren<BoxProps>) => {
  const classes = useStyles();

  return (
    <Box className={classes.root} {...props}>
      {children}
    </Box>
  );
};

export default Page;
