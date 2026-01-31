import{ useCallback, useEffect, useState } from 'react';
import {
  Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useSSO } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';



export const useOAuthButtons = () => {
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const [loading, setLoading] =useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const onGoogleSignInPress = useCallback(async () => {
    try {
      setLoading(true);
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId) {
        await setActive!({
          session: createdSessionId,
          navigate: () => router.push('/'),
        });
      }
    } catch (err) {
      console.error('OAuth error:', JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  }, [startSSOFlow, router]);


  return {
    onGoogleSignInPress,
    loading
  };
};