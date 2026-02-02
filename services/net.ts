import NetInfo from '@react-native-community/netinfo';


export const subscribeToNetwork = (callback: (isConnected: boolean) => void) =>
{
  return NetInfo.addEventListener((state) =>
  {
    callback(!!state.isConnected);
  });
};
