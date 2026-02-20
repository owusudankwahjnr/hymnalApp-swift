import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { MusicBackground } from './MusicBackground';

interface LayoutProps {
    children: React.ReactNode;
    style?: ViewStyle;
    noPadding?: boolean;
    variant?: 'default' | 'library' | 'player';
}

export const Layout: React.FC<LayoutProps> = ({ children, style, variant = 'default' }) => {
    return (
        <MusicBackground variant={variant} style={styles.container}>
            <View style={[styles.content, style]}>
                {children}
            </View>
        </MusicBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});
