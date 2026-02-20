import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { PlayerProvider } from './src/context/PlayerContext';
import { RootNavigator } from './src/navigation';
import { SplashScreen as CustomSplashScreen } from './src/components/SplashScreen';
import { seedDatabase } from './src/db/seed';
import { database } from './src/db';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import Animated, { FadeOut } from 'react-native-reanimated';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const AppContent = ({ onReady }: { onReady: () => void }) => {
  const { theme } = useSettings();
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    // We wait a bit before switching from the custom splash to the app content
    const timer = setTimeout(() => {
      setShowCustomSplash(false);
    }, 2500); // Allow time for the brand animation

    return () => clearTimeout(timer);
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
        // Seed database from local JSON file
        await seedDatabase();
        
        // Give some initial background work time without block
        await new Promise(resolve => setTimeout(resolve, 500));
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
      // Hide the native splash screen immediately when the Root View is ready.
      // The AppContent will then handle the transition from its own CustomSplashScreen.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <DatabaseProvider database={database}>
          <SettingsProvider>
            <FavoritesProvider>
              <PlayerProvider>
                <AppContent onReady={() => {}} />
              </PlayerProvider>
            </FavoritesProvider>
          </SettingsProvider>
        </DatabaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
