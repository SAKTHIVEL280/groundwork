// ============================================
// Groundwork - Multi-Theme System (Material You M3)
// ============================================
// Supports 6 color schemes × light/dark modes.
// ============================================

import { createTheme, type ThemeOptions, type PaletteOptions } from '@mui/material/styles';
import type { ColorScheme } from '@groundwork/types';

// Re-export for backwards compatibility
export type { ColorScheme } from '@groundwork/types';

export const COLOR_SCHEME_LABELS: Record<ColorScheme, string> = {
  purple: 'Purple',
  blue: 'Blue',
  green: 'Green',
  orange: 'Orange',
  pink: 'Pink',
  teal: 'Teal',
};

export const COLOR_SCHEME_PREVIEW: Record<ColorScheme, string> = {
  purple: '#6750A4',
  blue: '#1565C0',
  green: '#2E7D32',
  orange: '#E65100',
  pink: '#C2185B',
  teal: '#00796B',
};

// --- Shared Component Overrides ---
const sharedThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.25rem', letterSpacing: '-0.02em', lineHeight: 1.2 },
    h2: { fontWeight: 600, fontSize: '1.75rem', letterSpacing: '-0.01em', lineHeight: 1.3 },
    h3: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.3 },
    h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
    body1: { fontSize: '0.95rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    caption: { fontSize: '0.75rem', lineHeight: 1.5, letterSpacing: '0.02em' },
    overline: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em' },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '8px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
        },
        sizeSmall: {
          padding: '6px 14px',
          fontSize: '0.8125rem',
          borderRadius: 10,
        },
        contained: {
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': { borderWidth: 1.5 },
        },
      },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid',
          boxShadow: 'none',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        },
      },
    },
    MuiFab: {
      styleOverrides: { root: { borderRadius: 16 } },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, fontSize: '0.75rem' },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 24, padding: 8 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { border: 'none' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          minHeight: 40,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { borderRadius: 3, height: 3 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 8, height: 6 },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingTop: 8,
          paddingBottom: 8,
          marginBottom: 2,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 8, fontSize: '0.75rem' },
      },
    },
  },
};

// --- Color Tokens per Scheme ---
interface ColorTokens {
  primary: string; primaryLight: string; primaryDark: string; primaryContrastText: string;
  secondary: string; secondaryLight: string;
  bgDefault: string; bgPaper: string;
  textPrimary: string; textSecondary: string; divider: string;
  dPrimary: string; dPrimaryLight: string; dPrimaryDark: string; dPrimaryContrastText: string;
  dSecondary: string; dSecondaryLight: string;
  dBgDefault: string; dBgPaper: string;
  dTextPrimary: string; dTextSecondary: string; dDivider: string;
}

const COLOR_TOKENS: Record<ColorScheme, ColorTokens> = {
  purple: {
    primary: '#6750A4', primaryLight: '#D0BCFF', primaryDark: '#4F378B', primaryContrastText: '#fff',
    secondary: '#625B71', secondaryLight: '#CCC2DC',
    bgDefault: '#FDFAFF', bgPaper: '#FFFFFF',
    textPrimary: '#1D1B20', textSecondary: '#49454F', divider: '#E0DBE4',
    dPrimary: '#D0BCFF', dPrimaryLight: '#EADDFF', dPrimaryDark: '#6750A4', dPrimaryContrastText: '#381E72',
    dSecondary: '#CCC2DC', dSecondaryLight: '#E8DEF8',
    dBgDefault: '#131317', dBgPaper: '#1D1B22',
    dTextPrimary: '#E6E0E9', dTextSecondary: '#CAC4D0', dDivider: '#3A3640',
  },
  blue: {
    primary: '#1565C0', primaryLight: '#90CAF9', primaryDark: '#0D47A1', primaryContrastText: '#fff',
    secondary: '#546E7A', secondaryLight: '#B0BEC5',
    bgDefault: '#F8FBFF', bgPaper: '#FFFFFF',
    textPrimary: '#1A1C1E', textSecondary: '#43474E', divider: '#DEE3EB',
    dPrimary: '#90CAF9', dPrimaryLight: '#BBDEFB', dPrimaryDark: '#1565C0', dPrimaryContrastText: '#0A2E5C',
    dSecondary: '#B0BEC5', dSecondaryLight: '#CFD8DC',
    dBgDefault: '#111418', dBgPaper: '#1A1D22',
    dTextPrimary: '#E2E2E6', dTextSecondary: '#C3C6CF', dDivider: '#363940',
  },
  green: {
    primary: '#2E7D32', primaryLight: '#A5D6A7', primaryDark: '#1B5E20', primaryContrastText: '#fff',
    secondary: '#607D6A', secondaryLight: '#B5CCB9',
    bgDefault: '#F6FBF4', bgPaper: '#FFFFFF',
    textPrimary: '#1A1C19', textSecondary: '#43483F', divider: '#DEE5D9',
    dPrimary: '#A5D6A7', dPrimaryLight: '#C8E6C9', dPrimaryDark: '#2E7D32', dPrimaryContrastText: '#0A3A0F',
    dSecondary: '#B5CCB9', dSecondaryLight: '#D0E8D4',
    dBgDefault: '#111412', dBgPaper: '#1A1D1B',
    dTextPrimary: '#E2E3DD', dTextSecondary: '#C3C8BF', dDivider: '#363A33',
  },
  orange: {
    primary: '#E65100', primaryLight: '#FFAB91', primaryDark: '#BF360C', primaryContrastText: '#fff',
    secondary: '#795548', secondaryLight: '#BCAAA4',
    bgDefault: '#FFFBF8', bgPaper: '#FFFFFF',
    textPrimary: '#1F1A17', textSecondary: '#51443B', divider: '#E7DDD6',
    dPrimary: '#FFAB91', dPrimaryLight: '#FFCCBC', dPrimaryDark: '#E65100', dPrimaryContrastText: '#5C1E00',
    dSecondary: '#BCAAA4', dSecondaryLight: '#D7CCC8',
    dBgDefault: '#151210', dBgPaper: '#1F1B18',
    dTextPrimary: '#ECE0DA', dTextSecondary: '#D0C4BC', dDivider: '#3E3631',
  },
  pink: {
    primary: '#C2185B', primaryLight: '#F48FB1', primaryDark: '#880E4F', primaryContrastText: '#fff',
    secondary: '#78616B', secondaryLight: '#C8B3BD',
    bgDefault: '#FFFBFC', bgPaper: '#FFFFFF',
    textPrimary: '#201A1C', textSecondary: '#514349', divider: '#E7DEE1',
    dPrimary: '#F48FB1', dPrimaryLight: '#F8BBD0', dPrimaryDark: '#C2185B', dPrimaryContrastText: '#5C0728',
    dSecondary: '#C8B3BD', dSecondaryLight: '#E0CCDA',
    dBgDefault: '#151113', dBgPaper: '#1F1A1C',
    dTextPrimary: '#ECE0E4', dTextSecondary: '#D0C4C9', dDivider: '#3E353A',
  },
  teal: {
    primary: '#00796B', primaryLight: '#80CBC4', primaryDark: '#004D40', primaryContrastText: '#fff',
    secondary: '#4E6B66', secondaryLight: '#A3C1BC',
    bgDefault: '#F4FBFA', bgPaper: '#FFFFFF',
    textPrimary: '#191C1C', textSecondary: '#3F4948', divider: '#DAE5E3',
    dPrimary: '#80CBC4', dPrimaryLight: '#B2DFDB', dPrimaryDark: '#00796B', dPrimaryContrastText: '#003730',
    dSecondary: '#A3C1BC', dSecondaryLight: '#C1DBD7',
    dBgDefault: '#101414', dBgPaper: '#191D1D',
    dTextPrimary: '#DEE4E3', dTextSecondary: '#BFC9C7', dDivider: '#333A39',
  },
};

function buildPalette(scheme: ColorScheme, mode: 'light' | 'dark'): PaletteOptions {
  const t = COLOR_TOKENS[scheme];
  if (mode === 'light') {
    return {
      mode: 'light',
      primary: { main: t.primary, light: t.primaryLight, dark: t.primaryDark, contrastText: t.primaryContrastText },
      secondary: { main: t.secondary, light: t.secondaryLight, contrastText: '#fff' },
      error: { main: '#B3261E', light: '#F9DEDC', dark: '#8C1D18' },
      warning: { main: '#E8A317', light: '#FFF0C7', dark: '#B37A00' },
      success: { main: '#2E7D32', light: '#C8E6C9', dark: '#1B5E20' },
      background: { default: t.bgDefault, paper: t.bgPaper },
      text: { primary: t.textPrimary, secondary: t.textSecondary },
      divider: t.divider,
    };
  }
  return {
    mode: 'dark',
    primary: { main: t.dPrimary, light: t.dPrimaryLight, dark: t.dPrimaryDark, contrastText: t.dPrimaryContrastText },
    secondary: { main: t.dSecondary, light: t.dSecondaryLight, contrastText: '#1C1B1F' },
    error: { main: '#F2B8B5', light: '#F9DEDC', dark: '#B3261E' },
    warning: { main: '#FFD54F', light: '#FFF0C7', dark: '#E8A317' },
    success: { main: '#81C784', light: '#C8E6C9', dark: '#2E7D32' },
    background: { default: t.dBgDefault, paper: t.dBgPaper },
    text: { primary: t.dTextPrimary, secondary: t.dTextSecondary },
    divider: t.dDivider,
  };
}

// --- Build Theme ---
export function buildTheme(scheme: ColorScheme, mode: 'light' | 'dark') {
  return createTheme({
    ...sharedThemeOptions,
    palette: buildPalette(scheme, mode),
  });
}


