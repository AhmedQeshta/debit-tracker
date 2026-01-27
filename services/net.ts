import NetInfo from '@react-native-community/netinfo';

export const checkNetwork = async () => {
  const state = await NetInfo.fetch();
  return !!state.isConnected;
};

export const subscribeToNetwork = (callback: (isConnected: boolean) => void) => {
  return NetInfo.addEventListener((state) => {
    callback(!!state.isConnected);
  });
};
