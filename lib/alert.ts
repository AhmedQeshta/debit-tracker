import { Alert } from "react-native";

/**
 * Alert helpers
 */
export const confirmDelete = (
  title: string,
  message: string,
  onConfirm: () => void
): void => Alert.alert(title, message, [
  { text: "Cancel", style: "cancel" },
  { text: "Delete", style: "destructive", onPress: onConfirm },
]);

export const showSuccess = (
  title: string,
  message: string,
  onPress?: () => void
): void => Alert.alert(title, message, [
  { text: "OK", onPress },
]);

export const showError = (title: string, message: string): void => Alert.alert(title, message);
