import { createMuiTheme } from '@material-ui/core/styles';
import { blue, cyan, lime, amber, deepOrange } from '@material-ui/core/colors';

const COLOR_SHADE = 300;

const colors = {
  primary: '#01579b',
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

export const CSS_VARIABLES = {
  surface: 'rgba(255,255,255,1)',
  background: 'rgb(250, 249, 248, 1)',
  backgroundDark: 'rgba(5,5,5,1)',
  backgroundSecondary: 'rgb(250, 251, 252)',
  backgroundTertiary: 'rgb(246, 248, 250)',
  text: 'rgba(12,12,12,1)',
  reversedText: 'rgba(255,255,255,1)',
  button: 'rgba(21, 121, 193, 1)',
  border: '#dedede80',
  underlay: '#DDDDDD',
  statusBar: 'rgba(21,101,192,1)',
  bottomBar: 'rgba(255,255,255,1)',
  headerHeight: 40,
  headerColor: 'rgba(31,31,31,1)',
  headerTextColor: 'white',
  marginHorizontal: 40,
  borderRadius: 8,
  greyText: 'rgba(0, 0, 0, 0.5)',
  snackbar: 'rgba(31,31,31,1)',
  caption: '#494949',
  highlightOnSurface: '#dedede60',
  scrollbar: 'rgb(204, 204, 204)',
  maxWidth: 1260,
  cardPadding: 16,
  pageMargin: 20,
  pageMagrginTop: 0,
};

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    global: {
      surface: string;
      background: string;
      backgroundDark: string;
      backgroundSecondary: string;
      backgroundTertiary: string;
      text: string;
      reversedText: string;
      button: string;
      border: string;
      underlay: string;
      statusBar: string;
      bottomBar: string;
      headerHeight: number;
      headerColor: string;
      headerTextColor: string;
      marginHorizontal: number;
      borderRadius: number;
      greyText: string;
      snackbar: string;
      caption: string;
      highlightOnSurface: string;
      scrollbar: string;
      maxWidth: number;
      cardPadding: number;
      pageMargin: number;
      pageMagrginTop: number;
    };
  }
  interface ThemeOptions {
    global: {
      surface: string;
      background: string;
      backgroundDark: string;
      backgroundSecondary: string;
      backgroundTertiary: string;
      text: string;
      reversedText: string;
      button: string;
      border: string;
      underlay: string;
      statusBar: string;
      bottomBar: string;
      headerHeight: number;
      headerColor: string;
      headerTextColor: string;
      marginHorizontal: number;
      borderRadius: number;
      greyText: string;
      snackbar: string;
      caption: string;
      highlightOnSurface: string;
      scrollbar: string;
      maxWidth: number;
      cardPadding: number;
      pageMargin: number;
      pageMagrginTop: number;
    };
  }
}

export const THEME = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#01579b',
    },
    secondary: {
      main: '#ff8a65',
    },
  },
  global: CSS_VARIABLES,
});

export const CSS_VARIABLES_DARK = {
  ...CSS_VARIABLES,
  surface: 'rgba(31,31,31,1)',
  background: 'rgba(5,5,5,1)',
  text: 'rgba(255,255,255,1)',
  reversedText: 'rgba(12,12,12,1)',
  button: 'rgba(92, 158, 235, 1)',
  border: '#bdbcc24d',
  underlay: '#bdbcc233',
  statusBar: 'rgba(5,5,5,1)',
  bottomBar: 'rgba(31,31,31,1)',
  caption: 'rgba(255,255,255,0.5)',
  snackbar: 'rgba(255,255,255,1)',
  highlightOnSurface: '#dedede1f',
  scrollbar: 'rgb(80, 80, 80)',
  backgroundSecondary: '#333',
  headerColor: 'rgba(31,31,31,1)',
  headerTextColor: 'white',
};

export const DARK_THEME = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#ff8a65',
    },
    secondary: {
      main: '#ff8a65',
    },
  },
  global: CSS_VARIABLES,
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
