import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../context/SettingsContext';
import { getMusicPalette } from '../constants/musicTheme';

interface Props {
    children: React.ReactNode;
    variant?: 'default' | 'library' | 'player';
    style?: ViewStyle;
}

export const MusicBackground: React.FC<Props> = ({ children, variant = 'default', style }) => {
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);

    const gradient = variant === 'player' ? palette.gradientAlt : palette.gradient;

    const orbPrimary = variant === 'library' ? palette.orbSecondary : palette.orbPrimary;
    const orbSecondary = variant === 'library' ? palette.orbPrimary : palette.orbSecondary;

    return (
        <View style={[styles.container, style]}>
            <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} />
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
});
