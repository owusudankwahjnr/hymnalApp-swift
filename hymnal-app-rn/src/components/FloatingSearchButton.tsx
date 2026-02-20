import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import { getMusicPalette } from '../constants/musicTheme';

interface Props {
    onPress: () => void;
    visible: boolean;
}

export const FloatingSearchButton: React.FC<Props> = ({ onPress, visible }) => {
    const scale = useRef(new Animated.Value(0)).current;
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);

    useEffect(() => {
        Animated.spring(scale, {
            toValue: visible ? 1 : 0,
            useNativeDriver: true,
            friction: 5,
            tension: 40,
        }).start();
    }, [visible]);

    return (
        <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
            <TouchableOpacity
                style={[styles.button, { shadowColor: palette.shadow, backgroundColor: palette.surface }]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <Ionicons name="search" size={24} color={palette.text} />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.xl,
        zIndex: 100,
    },
    button: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        overflow: 'hidden',
    },
});
