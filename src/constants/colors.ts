import { createTheme } from '@material-ui/core/styles';
import { blue, cyan, lime, amber, deepOrange } from '@material-ui/core/colors';

const COLOR_SHADE = 300;

const colors = {
  primary: '#ea4c89',
  accent: '#f7c188',
  primaryDark: '#1F1F1F',
  randomColors: [
    'rgba(253,149,141,1)',
    'rgba(241,153,40,1)',
    'rgba(3,218,197,1)',
    'rgba(0,142,204,1)',
    'rgba(187,134,252,1)',
    'rgba(102,204,255,1)',
    'rgba(255,111,199,1)',
    'rgba(50,144,144,1)',
    'rgba(211,124,177,1)',
    'rgba(153,204,255,1)',
    'rgba(205, 102, 102,1)',
    'rgba(132,143,106,1)',
    'rgba(243,195,154,1)',
    'rgba(255,153,204,1)',
  ],
  gradeColors: {
    A: blue[COLOR_SHADE],
    B: cyan[COLOR_SHADE],
    C: lime[COLOR_SHADE],
    D: amber[COLOR_SHADE],
    F: deepOrange[COLOR_SHADE],
  },
};

export const THEME = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#01579b',
    },
    secondary: {
      main: '#ff8a65',
    },
    background: {
      paper: 'rgba(255, 255, 255, 1)',
    },
  },
});

export const DARK_THEME = createTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#ff8a65',
    },
    secondary: {
      main: '#ff8a65',
    },
    background: {
      paper: 'rgba(31, 31, 31, 1)',
    },
  },
});

/*
    'A': 'rgba(160, 231, 229, 1)',
    'B': 'rgba(180, 248, 200, 1)',
    'C': 'rgba(251, 231, 198, 1)',
    'D': 'rgba(238, 198, 251, 1)',
    'F': 'rgba(255, 174, 188, 1)',
*/

/*
    'A': 'rgba(79, 232, 94, 0.97)',
    'B': 'rgba(176, 232, 79, 0.97)',
    'C': 'rgba(255, 206, 84, 1)',
    'D': 'rgba(255, 148, 82, 1)',
    'F': 'rgba(237, 85, 100, 1)',
*/

export default colors;
