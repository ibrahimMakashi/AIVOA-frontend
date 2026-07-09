import { createTheme, alpha } from '@mui/material/styles';

const INTER = "'Inter', sans-serif";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565C0',
      light: '#1976D2',
      dark: '#0D47A1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00897B',
      light: '#26A69A',
      dark: '#00695C',
      contrastText: '#ffffff',
    },
    // AI-filled field indicator colour
    ai: {
      main: '#00B09B',
      light: '#E0F7F4',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F0F4F8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A2332',
      secondary: '#546E7A',
    },
    divider: '#E8EDF2',
    success: { main: '#2E7D32', light: '#E8F5E9' },
    warning: { main: '#E65100', light: '#FFF3E0' },
    error: { main: '#C62828', light: '#FFEBEE' },
    info: { main: '#0277BD', light: '#E1F5FE' },
  },

  typography: {
    fontFamily: INTER,
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.015em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600, letterSpacing: '-0.005em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500, color: '#546E7A' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', color: '#78909C' },
    button: { fontWeight: 600, letterSpacing: '0.01em', textTransform: 'none' },
  },

  shape: { borderRadius: 10 },

  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.06)',
    '0 2px 6px rgba(0,0,0,0.07)',
    '0 4px 12px rgba(0,0,0,0.08)',
    '0 6px 16px rgba(0,0,0,0.09)',
    '0 8px 24px rgba(0,0,0,0.10)',
    '0 12px 32px rgba(0,0,0,0.11)',
    '0 16px 40px rgba(0,0,0,0.12)',
    ...Array(17).fill('none'),
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { fontFamily: INTER, WebkitFontSmoothing: 'antialiased' },
        '::-webkit-scrollbar': { width: '6px', height: '6px' },
        '::-webkit-scrollbar-track': { background: 'transparent' },
        '::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '3px' },
        '::-webkit-scrollbar-thumb:hover': { background: '#A0AEC0' },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          '&:hover': { boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)' },
        },
        sizeLarge: { padding: '12px 28px', fontSize: '0.9375rem' },
        sizeSmall: { padding: '5px 12px', fontSize: '0.8125rem' },
      },
    },

    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FAFBFC',
            transition: 'all 0.2s ease',
            '&:hover': { backgroundColor: '#F5F7FA' },
            '&.Mui-focused': { backgroundColor: '#FFFFFF' },
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 8 },
        notchedOutline: { borderColor: '#E2E8F0' },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #E8EDF2',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.2s ease',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: 12 },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500, fontSize: '0.8125rem' },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: '#546E7A',
          fontSize: '0.8125rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          backgroundColor: '#F8FAFC',
          borderBottom: '2px solid #E8EDF2',
        },
        body: { fontSize: '0.875rem', color: '#1A2332' },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 0',
          '&.Mui-selected': {
            backgroundColor: alpha('#1565C0', 0.08),
            color: '#1565C0',
            '&:hover': { backgroundColor: alpha('#1565C0', 0.12) },
            '& .MuiListItemIcon-root': { color: '#1565C0' },
          },
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1A2332',
          fontSize: '0.75rem',
          borderRadius: 6,
          padding: '6px 10px',
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 4 },
      },
    },

    MuiSkeleton: {
      defaultProps: { animation: 'wave' },
    },
  },
});

export default theme;
