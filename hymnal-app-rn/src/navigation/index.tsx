import React from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiscoveryScreen } from '../screens/DiscoveryScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { BrowseScreen } from '../screens/BrowseScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HymnDetailScreen } from '../screens/HymnDetailScreen';
import { HymnListScreen } from '../screens/HymnListScreen';
import { PlaylistScreen } from '../screens/PlaylistScreen';
import { PlaylistDetailScreen } from '../screens/PlaylistDetailScreen';
import { HymnbooksScreen } from '../screens/HymnbooksScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { AcknowledgementsScreen } from '../screens/AcknowledgementsScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { PlayerModal } from '../screens/PlayerModal';
import { PodcastPlayerModal } from '../screens/PodcastPlayerModal';
import { useSettings } from '../context/SettingsContext';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';
import { MiniPlayer } from '../components/MiniPlayer';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            tabBar={(props) => (
                <View style={{ backgroundColor: palette.background }}>
                    <MiniPlayer variant="docked" />
                    <BottomTabBar {...props} />
                </View>
            )}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'book';


                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Browse') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'Library') {
                        iconName = focused ? 'library' : 'library-outline';
                    } else if (route.name === 'Hymnbooks') {
                        iconName = focused ? 'book' : 'book-outline';
                    }

                    return <Ionicons name={iconName} size={22} color={color} />;
                },
                tabBarActiveTintColor: palette.text,
                tabBarInactiveTintColor: palette.textMuted,
                headerShown: true,
                tabBarStyle: {
                    backgroundColor: palette.background,
                    borderTopWidth: 0,
                    height: 56 + insets.bottom,
                    paddingTop: 8,
                    paddingBottom: Math.max(insets.bottom, 10),
                },
                tabBarHideOnKeyboard: true,
                tabBarLabelStyle: {
                    fontFamily: MUSIC_FONTS.ui,
                    fontSize: 11,
                    letterSpacing: 0.2,
                    textTransform: 'none',
                    marginTop: 4,
                },
                tabBarItemStyle: { paddingVertical: 2 },
                headerStyle: {
                    backgroundColor: theme.background,
                },
                headerTintColor: theme.text,
            })}
        >
            <Tab.Screen name="Home" component={DiscoveryScreen} options={{ headerShown: false }} />
            <Tab.Screen
                name="Browse"
                component={BrowseScreen}
                options={{ headerShown: false, tabBarLabel: 'Search' }}
            />
            <Tab.Screen name="Library" component={LibraryScreen} options={{ headerShown: false }} />
            <Tab.Screen
                name="Hymnbooks"
                component={HymnbooksScreen}
                options={{ headerShown: false, tabBarLabel: 'Hymnbook' }}
            />
        </Tab.Navigator>
    );
};

export const RootNavigator = () => {
    const { theme, themeMode } = useSettings();

    const linking = {
        prefixes: ['hymnalapp://', 'hymnalapp://app'],
        config: {
            screens: {
                HymnDetail: {
                    path: 'hymn/:hymnId',
                },
            },
        },
    };

    const navigationTheme = {
        ...(themeMode === 'dark' ? DarkTheme : DefaultTheme),
        colors: {
            ...(themeMode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
            background: theme.background,
            card: theme.card,
            text: theme.text,
            border: theme.border,
            primary: theme.primary,
        },
    };

    return (
        <NavigationContainer linking={linking} theme={navigationTheme}>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: theme.background,
                    },
                    headerTintColor: theme.text,
                    contentStyle: {
                        backgroundColor: theme.background,
                    }
                }}
            >
                <Stack.Screen
                    name="Main"
                    component={TabNavigator}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Playlists"
                    component={PlaylistScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="PlaylistDetail"
                    component={PlaylistDetailScreen}
                    options={{ headerShown: true, headerBackTitle: 'Back' }}
                />
                <Stack.Screen
                    name="HymnList"
                    component={HymnListScreen}
                    options={({ route }: any) => ({
                        title: route.params?.hymnBookTitle || 'Hymns',
                        headerBackTitle: 'Back',
                        headerShown: true,
                        gestureEnabled: true,
                    })}
                />
                <Stack.Screen
                    name="HymnDetail"
                    component={HymnDetailScreen}
                    options={{
                        title: '',
                        headerBackTitle: 'Back',
                        gestureEnabled: true,
                    }}
                />
                <Stack.Screen
                    name="About"
                    component={AboutScreen}
                    options={{
                        title: 'About',
                        headerBackTitle: 'Back',
                        headerShown: true,
                        gestureEnabled: true,
                    }}
                />
                <Stack.Screen
                    name="Acknowledgements"
                    component={AcknowledgementsScreen}
                    options={{
                        title: 'Acknowledgements',
                        headerBackTitle: 'Back',
                        headerShown: true,
                        gestureEnabled: true,
                    }}
                />
                <Stack.Screen
                    name="Terms"
                    component={TermsScreen}
                    options={{
                        title: 'Terms & Conditions',
                        headerBackTitle: 'Back',
                        headerShown: true,
                        gestureEnabled: true,
                    }}
                />
                <Stack.Screen
                    name="Favorites"
                    component={FavoritesScreen}
                    options={{
                        title: 'Favorites',
                        headerBackTitle: 'Library',
                        headerShown: true,
                        gestureEnabled: true,
                    }}
                />
                <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{
                        title: 'Settings',
                        headerShown: false,
                        gestureEnabled: true,
                    }}
                />
                <Stack.Screen
                    name="Search"
                    component={SearchScreen}
                    options={{
                        title: 'Search',
                        headerShown: false,
                        gestureEnabled: true,
                    }}
                />
                <Stack.Screen
                    name="Player"
                    component={PlayerModal}
                    options={{
                        presentation: 'modal',
                        headerShown: false,
                        gestureEnabled: true,
                    }}
                />
                <Stack.Screen
                    name="PodcastPlayer"
                    component={PodcastPlayerModal}
                    options={{
                        presentation: 'modal',
                        headerShown: false,
                        gestureEnabled: true,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
