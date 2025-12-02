import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { RootNavigator } from './src/navigation';
import { SplashScreen as CustomSplashScreen } from './src/components/SplashScreen';
import { seedDatabase } from './src/db/seed';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  const { theme, themeMode } = useSettings();
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    // Hide native splash screen and show custom one
    const hideNativeSplash = async () => {
      await SplashScreen.hideAsync();
      setTimeout(() => {
        setShowCustomSplash(false);
      }, 1000);
    };
    hideNativeSplash();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} backgroundColor={theme.background} />
      {showCustomSplash ? (
        <CustomSplashScreen />
      ) : (
        <RootNavigator />
      )}
    </View>
  );
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await seedDatabase();
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // We handle splash hiding in AppContent now
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <SettingsProvider>
        <FavoritesProvider>
          <AppContent />
        </FavoritesProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
