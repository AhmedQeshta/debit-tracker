import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MenuItem {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

interface MenuModalState {
  visible: boolean;
  anchorRect: AnchorRect | null;
  menuItems: MenuItem[];
}

interface MenuModalContextType {
  openMenu: (anchorRect: AnchorRect, menuItems: MenuItem[]) => void;
  closeMenu: () => void;
  menuState: MenuModalState;
}

const MenuModalContext = createContext<MenuModalContextType | undefined>(undefined);

export const MenuModalProvider = ({ children }: { children: ReactNode }) => {
  const [menuState, setMenuState] = useState<MenuModalState>({
    visible: false,
    anchorRect: null,
    menuItems: [],
  });

  const openMenu = (anchorRect: AnchorRect, menuItems: MenuItem[]) => {
    setMenuState({
      visible: true,
      anchorRect,
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

