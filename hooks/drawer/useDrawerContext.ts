import { IDrawerContextType } from "@/types/common";
import { createContext, useContext } from "react";

export const DrawerContext = createContext<IDrawerContextType | null>(null);


export const useDrawerContext = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within DrawerLayoutWrapper');
  }
  return context;
};