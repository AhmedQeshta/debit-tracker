import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MenuModalState {
  visible: boolean;
  position: { top: number; right: number };
  menuItems: Array<{
    icon: ReactNode;
    label: string;
    onPress: () => void;
    danger?: boolean;
  }>;
}

interface MenuModalContextType {
  openMenu: (position: { top: number; right: number }, menuItems: MenuModalState['menuItems']) => void;
  closeMenu: () => void;
  menuState: MenuModalState;
}

const MenuModalContext = createContext<MenuModalContextType | undefined>(undefined);

export const MenuModalProvider = ({ children }: { children: ReactNode }) => {
  const [menuState, setMenuState] = useState<MenuModalState>({
    visible: false,
    position: { top: 0, right: 0 },
    menuItems: [],
  });

  const openMenu = (position: { top: number; right: number }, menuItems: MenuModalState['menuItems']) => {
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

export const useMenuModal = () => {
  const context = useContext(MenuModalContext);
  if (!context) {
    throw new Error('useMenuModal must be used within MenuModalProvider');
  }
  return context;
};

