// src/theme.js
import { createTheme } from '@mui/material/styles';

const baseComponents = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
  },
};

export const getTheme = (mode = 'light') =>
  createTheme({
    ...baseComponents,
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: { main: '#2563eb' }, // blue-600
            background: {
              default: '#f3f4f6', // page background
              paper: '#ffffff',   // paper/cards
              sidebar: '#f9fafb',
              surface: '#0b1220', // dark-ish card (if you want)
            },
            text: { primary: '#111827', secondary: '#4b5563' },
          }
        : {
            primary: { main: '#60a5fa' }, // blue-400
            background: {
              default: '#071226', // page background (soft very dark)
              paper: '#020617',   // paper/cards background
              sidebar: '#071226',
              surface: '#0f172a', // card surface
            },
            text: { primary: '#e5e7eb', secondary: '#9ca3af' },
          }),
    },

    // override CssBaseline to set body background & color to theme values
    components: {
      ...baseComponents.components,
      MuiCssBaseline: {
        styleOverrides: (themeParam) => ({
          body: {
            backgroundColor: themeParam.palette.background.default,
            color: themeParam.palette.text.primary,
            // keep min-height so background covers full viewport
            minHeight: '100vh',
            // smooth background color transition
            transition: 'background-color 200ms ease, color 200ms ease',
          },
          // optional: unify scrollbars in dark mode
          '*, *::before, *::after': {
            boxSizing: 'border-box',
          },
        }),
      },
    },

    shape: { borderRadius: 20 },
  });
