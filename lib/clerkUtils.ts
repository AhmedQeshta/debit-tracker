import NetInfo from '@react-native-community/netinfo';

/**
 * Formats Clerk error objects into user-friendly error messages
 * @param error - Clerk error object or any error
 * @returns Formatted error message string
 */
export const formatClerkError = (error: any): string =>
{
  if (!error) return 'An unexpected error occurred';

  // Handle Clerk error structure
  if (error.errors && Array.isArray(error.errors) && error.errors.length > 0)
  {
    const firstError = error.errors[0];
    if (firstError.message)
    {
      return firstError.message;
    }
    if (firstError.longMessage)
    {
      return firstError.longMessage;
    }
  }

  // Handle direct message property
  if (error.message)
  {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string')
  {
    return error;
  }

  // Handle toString fallback
  const errorString = error.toString();
  if (errorString !== '[object Object]')
  {
    return errorString;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Checks if the device is currently offline
 * @returns Promise that resolves to true if offline, false if online
 */
export const isOffline = async (): Promise<boolean> =>
{
  try
  {
    const state = await NetInfo.fetch();
    return !state.isConnected;
  } catch (error)
  {
    console.error('[ClerkUtils] Error checking network status:', error);
    // Assume online if we can't check (better UX than blocking)
    return false;
  }
};

/**
 * Checks if offline and throws an error if so
 * @throws Error with message if offline
 */
export const checkOfflineAndThrow = async (): Promise<void> =>
{
  const offline = await isOffline();
  if (offline)
  {
    throw new Error('No internet connection. Please check your network and try again.');
  }
};

