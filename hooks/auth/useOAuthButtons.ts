import { useSSO } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const NATIVE_OAUTH_REDIRECT_URL = AuthSession.makeRedirectUri({
  scheme: 'debit-tracker',
  path: 'sso-callback',
});

export const useOAuthButtons = () => {
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const [loading, setLoading] = useState(false);

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
      const redirectUrl = NATIVE_OAUTH_REDIRECT_URL;

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl,
      });

      if (createdSessionId) {
        await setActive!({
          session: createdSessionId,
          navigate: () => router.push('/'),
        });
      }
    } catch (err: any) {
      console.error('[OAuth] Error during Google Sign-In:', err);
      console.error('[OAuth] Error details:', JSON.stringify(err, null, 2));

      // Log specific error types that might indicate redirect issues
      if (err?.message?.includes('redirect') || err?.message?.includes('redirect_uri')) {
        console.error(
          '[OAuth] Redirect URI error detected. Make sure the redirect URI is configured in Clerk Dashboard.',
        );
        console.error(`[OAuth] Expected redirect URI: ${NATIVE_OAUTH_REDIRECT_URL}`);
      }

      // Re-throw to allow UI to handle the error if needed
      throw err;
    } finally {
      setLoading(false);
    }
  }, [startSSOFlow, router]);

  return {
    onGoogleSignInPress,
    loading,
  };
};
