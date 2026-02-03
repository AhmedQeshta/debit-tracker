import { useMenuModal } from '@/contexts/MenuModalContext';
import type { AnchorRect, MenuItem } from '@/contexts/MenuModalContext';

export const useActionMenu = () => {
  const { menuState, openMenu, closeMenu } = useMenuModal();

  return {
    visible: menuState.visible,
    items: menuState.menuItems,
    anchorRect: menuState.anchorRect,
    openMenu: (anchorRect: AnchorRect, items: MenuItem[]) => {
      openMenu(anchorRect, items);
    },
    closeMenu,
  };
};

