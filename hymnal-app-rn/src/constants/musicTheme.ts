import { Platform } from 'react-native';

export type MusicMode = 'light' | 'dark';

export const MUSIC_FONTS = {
    display: Platform.select({ ios: 'New York', android: 'serif' }) || 'serif',
    headline: Platform.select({ ios: 'Avenir Next', android: 'sans-serif-condensed' }) || 'sans-serif',
    body: Platform.select({ ios: 'Avenir Next', android: 'sans-serif' }) || 'sans-serif',
    ui: Platform.select({ ios: 'Avenir Next', android: 'sans-serif-medium' }) || 'sans-serif',
    mono: Platform.select({ ios: 'Menlo', android: 'monospace' }) || 'monospace',
};

const lightPalette = {
    background: '#F7F7F5',
    backgroundAlt: '#EFEFEA',
    surface: '#FFFFFF',
    surfaceMuted: '#F2E7DA',
    text: '#1B1712',
    textMuted: '#6A5A4B',
    accent: '#1DB954',
    accentSecondary: '#1ED760',
    accentTertiary: '#CBA882',
    border: 'rgba(27, 23, 18, 0.12)',
    divider: 'rgba(27, 23, 18, 0.08)',
    glass: 'rgba(255, 255, 255, 0.6)',
    glassStrong: 'rgba(255, 255, 255, 0.8)',
    shadow: 'rgba(10, 8, 6, 0.22)',
    gradient: ['#F7F7F5', '#F7F7F5', '#F7F7F5'] as const,
    gradientAlt: ['#F7F7F5', '#F7F7F5', '#F7F7F5'] as const,
    rowGradient: ['rgba(255, 255, 255, 0.92)', 'rgba(255, 255, 255, 0.72)'] as const,
    cardGradient: ['rgba(255, 255, 255, 0.96)', 'rgba(255, 255, 255, 0.82)'] as const,
    orbPrimary: 'rgba(0,0,0,0)',
    orbSecondary: 'rgba(0,0,0,0)',
    orbTertiary: 'rgba(0,0,0,0)',
    overlay: 'rgba(10, 8, 6, 0.35)',
};

const darkPalette = {
    background: '#0B0B0B',
    backgroundAlt: '#141414',
    surface: '#1C1C1C',
    surfaceMuted: '#232323',
    text: '#FFFFFF',
    textMuted: '#A7A7A7',
    accent: '#1DB954',
    accentSecondary: '#1ED760',
    accentTertiary: '#C2A57D',
    border: 'rgba(255, 255, 255, 0.08)',
    divider: 'rgba(255, 255, 255, 0.06)',
    glass: 'rgba(28, 28, 28, 0.7)',
    glassStrong: 'rgba(34, 34, 34, 0.85)',
    shadow: 'rgba(0, 0, 0, 0.6)',
    gradient: ['#0B0B0B', '#0B0B0B', '#0B0B0B'] as const,
    gradientAlt: ['#0B0B0B', '#0B0B0B', '#0B0B0B'] as const,
    rowGradient: ['rgba(32, 32, 32, 0.9)', 'rgba(22, 22, 22, 0.75)'] as const,
    cardGradient: ['rgba(32, 32, 32, 0.92)', 'rgba(22, 22, 22, 0.82)'] as const,
    orbPrimary: 'rgba(0,0,0,0)',
    orbSecondary: 'rgba(0,0,0,0)',
    orbTertiary: 'rgba(0,0,0,0)',
    overlay: 'rgba(0, 0, 0, 0.6)',
};

export const MUSIC_PALETTE = {
    light: lightPalette,
    dark: darkPalette,
};

export type MusicPalette = typeof lightPalette;

export const getMusicPalette = (mode: MusicMode): MusicPalette => {
    return mode === 'dark' ? darkPalette : lightPalette;
};
