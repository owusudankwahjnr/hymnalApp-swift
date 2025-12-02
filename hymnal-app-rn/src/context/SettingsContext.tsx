import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, Theme } from '../constants/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsContextType {
    fontSize: number;
    setFontSize: (size: number) => Promise<void>;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => Promise<void>;
    theme: Theme;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [fontSize, setFontSizeState] = useState(18);
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const systemColorScheme = useColorScheme();

    useEffect(() => {
        console.log('Current themeMode:', themeMode);
        console.log('System color scheme:', systemColorScheme);
        console.log('Appearance.getColorScheme():', Appearance.getColorScheme());
    }, [themeMode, systemColorScheme]);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const storedSize = await AsyncStorage.getItem('settings_fontSize');
            if (storedSize) {
                setFontSizeState(parseInt(storedSize, 10));
            }

            const storedTheme = await AsyncStorage.getItem('settings_themeMode');
            if (storedTheme) {
                setThemeModeState(storedTheme as ThemeMode);
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        }
    };

    const setFontSize = async (size: number) => {
        try {
            setFontSizeState(size);
            await AsyncStorage.setItem('settings_fontSize', size.toString());
        } catch (error) {
            console.error('Failed to save font size', error);
        }
    };

    const setThemeMode = async (mode: ThemeMode) => {
        try {
            setThemeModeState(mode);
            await AsyncStorage.setItem('settings_themeMode', mode);
        } catch (error) {
            console.error('Failed to save theme mode', error);
        }
    };

    const getActiveTheme = (): Theme => {
        if (themeMode === 'system') {
            const currentScheme = systemColorScheme || Appearance.getColorScheme();
            return (currentScheme === 'dark') ? darkTheme : lightTheme;
        }
        return themeMode === 'dark' ? darkTheme : lightTheme;
    };

    const theme = getActiveTheme();

    return (
        <SettingsContext.Provider value={{ fontSize, setFontSize, themeMode, setThemeMode, theme }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
