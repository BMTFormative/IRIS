// frontend/src/theme/muiTheme.ts
import { createTheme } from '@mui/material/styles';

// Create a theme that matches your current Chakra UI design
export const muiTheme = createTheme({
  palette: {
    mode: 'light', // You can make this dynamic later
    primary: {
      main: '#3182ce', // Chakra UI blue.500 equivalent
      light: '#63b3ed',
      dark: '#2c5282',
    },
    secondary: {
      main: '#805ad5', // Chakra UI purple.500 equivalent
      light: '#b794f6',
      dark: '#553c9a',
    },
    error: {
      main: '#e53e3e', // Chakra UI red.500 equivalent
    },
    background: {
      default: '#ffffff',
      paper: '#f7fafc', // Chakra UI gray.50 equivalent
    },
    text: {
      primary: '#1a202c', // Chakra UI gray.800 equivalent
      secondary: '#4a5568', // Chakra UI gray.600 equivalent
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 8, // Chakra UI default border radius
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent uppercase transformation
          borderRadius: 8,
          fontWeight: 500,
        },
        containedPrimary: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '1rem',
          paddingRight: '1rem',
        },
      },
    },
  },
});

// Optional: Dark theme variant
export const muiDarkTheme = createTheme({
  ...muiTheme,
  palette: {
    ...muiTheme.palette,
    mode: 'dark',
    background: {
      default: '#1a202c',
      paper: '#2d3748',
    },
    text: {
      primary: '#f7fafc',
      secondary: '#cbd5e0',
    },
  },
});