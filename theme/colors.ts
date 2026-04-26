import { ActiveTheme } from '@/theme/types';

export type ThemeColors = {
  background: string;
  surface: string;
  surface2: string;
  text: string;
  textMuted: string;
  border: string;
  shadow: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  overlay: string;
  card: string;
  inputBg: string;
  inputText: string;
  placeholder: string;
  input: string;
  secondary: string;
  primary: string;
  textSecondary: string;
  error: string;
  mutedText: string;
};

const createThemeColors = (colors: {
  background: string;
  surface: string;
  surface2: string;
  text: string;
  textMuted: string;
  border: string;
  shadow: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  overlay: string;
  card: string;
  inputBg: string;
  inputText: string;
  placeholder: string;
  secondary: string;
}): ThemeColors => ({
  ...colors,
  // Backward-compatible aliases used across existing components.
  primary: colors.accent,
  textSecondary: colors.textMuted,
  error: colors.danger,
  mutedText: colors.textMuted,
  input: colors.inputBg,
});

export const lightColors = createThemeColors({
  background: '#F6F7F9',
  surface: '#FFFFFF',
  surface2: '#EEF1F4',
  text: '#111827',
  textMuted: '#566173',
  border: '#D5DCE4',
  shadow: 'rgba(15, 23, 42, 0.12)',
  accent: '#7E57C2',
  accentText: '#FFFFFF',
  accentSoft: '#EEE6FF',
  danger: '#B00020',
  dangerSoft: '#FEE7EA',
  success: '#2E7D32',
  successSoft: '#E8F6EA',
  warning: '#B7791F',
  warningSoft: '#FFF3DD',
  overlay: 'rgba(17, 24, 39, 0.2)',
  card: '#FFFFFF',
  inputBg: '#FFFFFF',
  inputText: '#111111',
  placeholder: '#8A9099',
  secondary: '#00897B',
});

export const darkColors = createThemeColors({
  background: '#121212',
  surface: '#1E1E1E',
  surface2: '#262626',
  text: '#FFFFFF',
  textMuted: '#B0B0B0',
  border: '#333333',
  shadow: 'rgba(0, 0, 0, 0.45)',
  accent: '#BB86FC',
  accentText: '#121212',
  accentSoft: 'rgba(187, 134, 252, 0.2)',
  danger: '#CF6679',
  dangerSoft: 'rgba(207, 102, 121, 0.22)',
  success: '#4CAF50',
  successSoft: 'rgba(76, 175, 80, 0.2)',
  warning: '#E0AE49',
  warningSoft: 'rgba(224, 174, 73, 0.2)',
  overlay: 'rgba(0, 0, 0, 0.55)',
  card: '#242424',
  inputBg: '#2C2C2C',
  inputText: '#FFFFFF',
  placeholder: '#8E96A3',
  secondary: '#03DAC6',
});

export const getColorsForTheme = (theme: ActiveTheme): ThemeColors =>
  theme === 'dark' ? darkColors : lightColors;

// Keep this export for legacy imports; runtime theming should use useTheme().
export const Colors = darkColors;
