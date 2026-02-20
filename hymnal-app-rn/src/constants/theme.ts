import { Platform } from 'react-native';

export const lightTheme = {
    primary: '#007AFF', // iOS Blue
    secondary: '#5856D6', // iOS Indigo
    background: '#F2F2F7', // iOS System Grouped Background
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    error: '#FF3B30',
    success: '#34C759',
    mode: 'light',
};

export const darkTheme = {
    primary: '#0A84FF', // iOS Dark Mode Blue
    secondary: '#5E5CE6', // iOS Dark Mode Indigo
    background: '#121212', // Softer Dark Background
    card: '#242426', // Slightly lighter card
    text: '#FFFFFF',
    textSecondary: '#9E9EA3', // Slightly lighter for better contrast
    border: '#3A3A3C',
    error: '#FF453A',
    success: '#32D74B',
    mode: 'dark',
};

export const COLORS = lightTheme; // Default for backward compatibility
export type Theme = typeof lightTheme;

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
};

export const FONTS = {
    regular: Platform.select({ ios: 'Avenir Next', android: 'serif' }) || 'serif',
    medium: Platform.select({ ios: 'Avenir Next', android: 'sans-serif-condensed' }) || 'serif',
    bold: Platform.select({ ios: 'Avenir Next', android: 'sans-serif-medium' }) || 'serif',
};
