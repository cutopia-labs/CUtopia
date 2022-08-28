import { createTheme, ThemeOptions } from '@mui/material/styles';

import {
  blue,
  cyan,
  lime,
  amber,
  deepOrange,
  purple,
  pink,
  teal,
  indigo,
  green,
  blueGrey,
  deepPurple,
} from '@mui/material/colors';
import addOpacity from '../helpers/updateOpacity';

const RANDOM_COLOR_BASES = [
  deepOrange,
  pink,
  purple,
  blue,
  teal,
  cyan,
  indigo,
  green,
  blueGrey,
  deepPurple,
];

const RANDOM_COLOR_SHADE = 500;
const RANDOM_COLOR_DARK_SHADE = 200;
const TIMETABLE_COLOR_SHADE = 300;
const GRADE_COLOR_SHADE = 500;

const getRandomColorsFromShade = shade =>
  RANDOM_COLOR_BASES.map(color => color[shade]);

const LIGHT_RANDOM_COLORS = getRandomColorsFromShade(RANDOM_COLOR_SHADE);
const DARK_RANDOM_COLORS = getRandomColorsFromShade(RANDOM_COLOR_DARK_SHADE);
const TIMETABLE_COLORS = getRandomColorsFromShade(TIMETABLE_COLOR_SHADE);

const colors = {
  primary: '#ea4c89',
  accent: '#f7c188',
  primaryDark: '#1F1F1F',
  randomColors: LIGHT_RANDOM_COLORS,
  timetableColors: TIMETABLE_COLORS,
  gradeColors: {
    A: blue[GRADE_COLOR_SHADE],
    B: cyan[GRADE_COLOR_SHADE],
    C: lime[GRADE_COLOR_SHADE],
    D: amber[GRADE_COLOR_SHADE],
    F: deepOrange[GRADE_COLOR_SHADE],
  },
  randomColorsLength: RANDOM_COLOR_BASES.length,
};

const NEUTURAL_BG = 'rgba(0, 0, 0, 0.08)';
const NEUTRUAL_BG_DARK = addOpacity(colors.primary, 0.08);
const HOVER_BG = 'rgba(0, 0, 0, 0.03)';
const HOVER_BG_DARK = addOpacity(colors.primary, 0.04);

const makeCommonTheme = (isDark = false): Partial<ThemeOptions> => ({
  components: {
    MuiButton: {
      styleOverrides: {
        text: {
          color: 'var(--text)',
        },
        root: {
          ':hover': {
            backgroundColor: isDark ? HOVER_BG_DARK : HOVER_BG,
          },
          '&.Mui-selected': {
            backgroundColor: isDark ? NEUTRUAL_BG_DARK : NEUTURAL_BG,
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'var(--border)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          ...(isDark && {
            '&.MuiButtonBase-root': {
              ':hover': {
                backgroundColor: isDark ? HOVER_BG_DARK : HOVER_BG,
              },
            },
          }),
          '&.Mui-selected': {
            'backgroundColor': isDark ? NEUTRUAL_BG_DARK : NEUTURAL_BG,
            ':hover': {
              backgroundColor: isDark ? NEUTRUAL_BG_DARK : NEUTURAL_BG,
            },
          },
        },
      },
    },
  },
});

export const THEME = createTheme({
  ...makeCommonTheme(false),
  palette: {
    mode: 'light',
    primary: {
      main: '#e21061',
    },
    secondary: {
      main: '#e21061', // #f06292
    },
    background: {
      paper: 'rgba(255, 255, 255, 1)',
    },
  },
});

export const DARK_THEME = createTheme({
  ...makeCommonTheme(true),
  palette: {
    mode: 'dark',
    primary: {
      main: '#d30051',
    },
    secondary: {
      main: '#ff8a65',
    },
    background: {
      paper: 'rgba(31, 31, 31, 1)',
    },
  },
});

export default colors;
