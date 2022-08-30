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

type ThemeType = 'light' | 'dark';

const themeColors: Record<ThemeType, any> = {
  light: {
    neuturalBg: 'rgba(0, 0, 0, 0.08)',
    hoverBg: 'rgba(0, 0, 0, 0.03)',
    primary: '#e21061', // #f06292
    secondary: '#e21061',
    paper: 'rgba(255, 255, 255, 1)',
  },
  dark: {
    neuturalBg: addOpacity(colors.primary, 0.08),
    hoverBg: addOpacity(colors.primary, 0.04),
    primary: '#d30051',
    secondary: '#ff8a65',
    paper: 'rgba(31, 31, 31, 1)',
  },
};

const makeTheme = (type: ThemeType): Partial<ThemeOptions> => ({
  palette: {
    mode: type,
    primary: {
      main: themeColors[type].primary,
    },
    secondary: {
      main: themeColors[type].secondary,
    },
    background: {
      paper: themeColors[type].paper,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        color: 'inherit',
      },
      styleOverrides: {
        root: {
          ':hover': {
            backgroundColor: themeColors[type].hoverBg,
          },
          '&.Mui-selected': {
            backgroundColor: themeColors[type].neuturalBg,
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
          ...(type === 'dark' && {
            '&.MuiButtonBase-root': {
              ':hover': {
                backgroundColor: themeColors[type].hoverBg,
              },
            },
          }),
          '&.Mui-selected': {
            'backgroundColor': themeColors[type].neuturalBg,
            ':hover': {
              backgroundColor: themeColors[type].neuturalBg,
            },
          },
        },
      },
    },
  },
});

export const THEME = createTheme(makeTheme('light'));

export const DARK_THEME = createTheme(makeTheme('dark'));

export default colors;
