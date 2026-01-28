import { User } from "@/types/models";

export interface IUserCardProps {
  user: User;
  balance: number;
  onPinToggle?: (userId: string) => void;
}
