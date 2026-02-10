import { useSSO } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

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

      // Generate redirect URI using the app's custom scheme
      // For production builds, use the custom scheme: debit-tracker://
      // For development (Expo Go), AuthSession.makeRedirectUri() will use exp://
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'debit-tracker',
        path: '',
      });

      // Fallback: if makeRedirectUri doesn't work as expected, use Linking
      const fallbackRedirectUri = Linking.createURL('', {});
      const finalRedirectUri = redirectUri || fallbackRedirectUri || 'debit-tracker://';

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: finalRedirectUri,
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
        console.error(
          '[OAuth] Expected redirect URI format: debit-tracker:// (for production builds)',
        );
        // In development with Expo Go, it will be something like exp://
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
