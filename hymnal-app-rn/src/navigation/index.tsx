import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HymnDetailScreen } from '../screens/HymnDetailScreen';
import { HymnListScreen } from '../screens/HymnListScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useSettings } from '../context/SettingsContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    const { theme } = useSettings();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'book';

                    if (route.name === 'Home') {
                        iconName = focused ? 'book' : 'book-outline';
                    } else if (route.name === 'Search') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'Favorites') {
                        iconName = focused ? 'heart' : 'heart-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textSecondary,
                headerShown: true,
                tabBarStyle: {
                    backgroundColor: theme.card,
                    borderTopColor: theme.border,
                },
                headerStyle: {
                    backgroundColor: theme.background,
                },
                headerTintColor: theme.text,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
};

export const RootNavigator = () => {
    const { theme, themeMode } = useSettings();

    const linking = {
        prefixes: ['hymnalapp://'],
        config: {
            screens: {
                HymnDetail: 'hymn/:hymnId',
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
                        title: 'Hymn Detail',
                        headerBackTitle: 'Back',
                        gestureEnabled: true,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
