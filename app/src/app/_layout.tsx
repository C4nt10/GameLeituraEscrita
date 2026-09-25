import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from '@expo-google-fonts/baloo-2';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontesCarregadas] = useFonts({
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  useEffect(() => {
    if (fontesCarregadas) {
      void SplashScreen.hideAsync();
    }
  }, [fontesCarregadas]);

  // segura a splash até a fonte carregar — evita o "flash" de texto no
  // system font (Roboto) antes de trocar pra Baloo 2/Figtree.
  if (!fontesCarregadas) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
