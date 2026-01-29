import { User } from "@/types/models";
import { IMenuItem } from "@/types/common";

export interface IUserCardProps {
  user: User;
  balance: number;
  showActions?: boolean;
  handleUserDelete: (userId: string, userName: string) => void;
  handlePinToggle: (userId: string) => void;
  showPinToggle?: boolean;
}


export interface GridUserCardProps {
  user: User;
  balance: number;
  menuItems: IMenuItem[];
}



export interface IFilteredUsersProps {
  item: User;
  isGrid: boolean;
  handleUserEdit: (userId: string) => void;
  handleUserDelete: (userId: string, userName: string) => void;
  handlePinToggle: (userId: string) => void;
}
