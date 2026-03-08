import { IMenuItem } from '@/types/common';
import { Friend } from '@/types/models';

export type FriendBalanceStatus = 'you-owe' | 'owes-you' | 'settled';

export interface IFriendListRow {
  friend: Friend;
  balance: number;
  amountText: string;
  directionLabel: 'You owe' | 'Owes you' | 'Settled';
  status: FriendBalanceStatus;
  subtitle: string;
}

export interface IFriendCardProps {
  row: IFriendListRow;
  menuItems: IMenuItem[];
  showActions?: boolean;
  handleFriendDelete: (friendId: string, friendName: string) => void;
  handlePinToggle: (friendId: string) => void;
  onCopyAmount: (amount: string) => void;
  onSettle: (friendId: string) => void;
  showPinToggle?: boolean;
}

export interface GridFriendCardProps {
  row: IFriendListRow;
  menuItems: IMenuItem[];
}

export interface IFilteredFriendsProps {
  row: IFriendListRow;
  isGrid: boolean;
  handleFriendEdit: (friendId: string) => void;
  handleFriendDelete: (friendId: string, friendName: string) => void;
  handlePinToggle: (friendId: string) => void;
  onCopyAmount: (friendId: string) => void;
  onSettle: (friendId: string) => void;
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

export type FriendsSortBy = 'recent' | 'name' | 'balance';
export type FriendsFilterBy = 'all' | 'you-owe' | 'owes-you' | 'settled';

export type FriendsListItem = IFriendListRow | { type: 'skeleton'; id: string };
