import i18n from '@/i18n';
import { IDrawerContextType } from '@/types/common';
import { createContext, useContext } from 'react';

export const DrawerContext = createContext<IDrawerContextType | null>(null);

export const useDrawerContext = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error(i18n.t('drawer.errors.useWithinLayout'));
  }
  return context;
};
