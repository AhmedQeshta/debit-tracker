import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { getColorsForTheme, ThemeColors } from '@/theme/colors';
import { ActiveTheme, ThemeMode } from '@/theme/types';

const THEME_MODE_STORAGE_KEY = 'app-theme-mode';
const DEFAULT_THEME_MODE: ThemeMode = 'system';

type ThemeContextValue = {
  themeMode: ThemeMode;
  activeTheme: ActiveTheme;
  colors: ThemeColors;
  isThemeReady: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(DEFAULT_THEME_MODE);
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadThemeMode = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);
        const resolvedMode: ThemeMode =
          savedThemeMode === 'light' || savedThemeMode === 'dark' || savedThemeMode === 'system'
            ? savedThemeMode
            : DEFAULT_THEME_MODE;

        if (isMounted) {
          setThemeModeState(resolvedMode);
        }
      } catch (error) {
        console.warn('[theme] Failed to load saved theme mode. Falling back to system.', error);
        if (isMounted) {
          setThemeModeState(DEFAULT_THEME_MODE);
        }
      } finally {
        if (isMounted) {
          setIsThemeReady(true);
        }
      }
    };

    void loadThemeMode();

    return () => {
      isMounted = false;
    };
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('[theme] Failed to persist theme mode.', error);
    }
  }, []);

  // In system mode, activeTheme tracks the current OS appearance in real time.
  const activeTheme: ActiveTheme =
    themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;

  const colors = useMemo(() => getColorsForTheme(activeTheme), [activeTheme]);

  const value = useMemo(
    () => ({ themeMode, activeTheme, colors, setThemeMode, isThemeReady }),
    [themeMode, activeTheme, colors, setThemeMode, isThemeReady],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const THEME_STORAGE = {
  KEY: THEME_MODE_STORAGE_KEY,
  DEFAULT_MODE: DEFAULT_THEME_MODE,
};
