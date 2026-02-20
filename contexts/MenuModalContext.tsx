import { MenuModalContextType, MenuModalState } from '@/types/common';
import React, { createContext, ReactNode, useState } from 'react';

export const MenuModalContext = createContext<MenuModalContextType | undefined>(undefined);

export const MenuModalProvider = ({ children }: { children: ReactNode }) => {
  const [menuState, setMenuState] = useState<MenuModalState>({
    visible: false,
    position: { top: 0, right: 0 },
    menuItems: [],
  });

  const openMenu = (
    position: { top: number; right: number },
    menuItems: MenuModalState['menuItems'],
  ) => {
    setMenuState({
      visible: true,
      position,
      menuItems,
    });
  };

  const closeMenu = () => {
    setMenuState((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  return (
    <MenuModalContext.Provider value={{ openMenu, closeMenu, menuState }}>
      {children}
    </MenuModalContext.Provider>
  );
};
