import { MenuModalContext } from '@/contexts/MenuModalContext';
import { useContext } from 'react';

export const useMenuModal = () => {
  const context = useContext(MenuModalContext);
  if (!context) {
    throw new Error('useMenuModal must be used within MenuModalProvider');
  }
  return context;
};
