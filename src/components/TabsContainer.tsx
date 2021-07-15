import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import { PropsWithChildren } from 'react';
import { MenuItem } from '../types';

import Card from './Card';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  tabsContainer: {
    'display': 'flex',
    'flexDirection': 'row',
    'overflow': 'scroll',
    'scrollbarWidth': 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  item: {
    'display': 'flex',
    'alignItems': 'center',
    'height': '48px',
    'cursor': 'pointer',
    'padding': '0px 16px 0px 16px',
    'transition': 'width 300ms cubic-bezier(0.7, 0, 0.3, 1) 0ms;',
    '&.active': {
      borderBottom: '2px solid #ff8a65 !important',
    },
    '&:hover': {
      borderBottom: '2px solid #dedede80',
    },
    '& svg': {
      fontSize: '16px',
    },
  },
  label: {
    marginLeft: '6px',
  },
}));

type TabsContainerProps = {
  tabs: MenuItem[];
  selected: string;
  onSelect: (label: string) => void;
};

const TabsContainer = ({
  tabs,
  selected,
  onSelect,
  children,
}: PropsWithChildren<TabsContainerProps>) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Card mb={1}>
        <Box className={classes.tabsContainer}>
          {tabs.map((tab) => (
            <Box
              key={tab.label}
              className={clsx(classes.item, { active: tab.label === selected })}
              onClick={() => onSelect(tab.label)}
            >
              {tab.icon}
              <Typography variant="caption" className={classes.label}>
                {tab.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>
      {children}
    </Box>
  );
};

export default TabsContainer;
