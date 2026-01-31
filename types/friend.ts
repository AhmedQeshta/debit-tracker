import { Friend } from '@/types/models';
import { IMenuItem } from '@/types/common';

export interface IFriendCardProps {
  friend: Friend;
  balance: number;
  showActions?: boolean;
  handleFriendDelete: (friendId: string, friendName: string) => void;
  handlePinToggle: (friendId: string) => void;
  showPinToggle?: boolean;
}

export interface GridFriendCardProps {
  friend: Friend;
  balance: number;
  menuItems: IMenuItem[];
}

export interface IFilteredFriendsProps {
  item: Friend;
  isGrid: boolean;
  handleFriendEdit: (friendId: string) => void;
  handleFriendDelete: (friendId: string, friendName: string) => void;
  handlePinToggle: (friendId: string) => void;
}

/**
 * Type definitions for form data and errors
 */
export interface IFriendFormData {
  name: string;
  bio: string;
  currency: string;
  email?: string;
}

export interface IFriendFormErrors {
  name?: string;
  bio?: string;
  currency?: string;
  email?: string;
}
