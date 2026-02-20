import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';

interface Props {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export const SearchBar = React.forwardRef<TextInput, Props>(({ value, onChangeText, placeholder = 'Search hymns...' }, ref) => {
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);

    return (
        <View style={[styles.container, { backgroundColor: palette.glass, borderColor: palette.border }]}>
            <Ionicons name="search" size={20} color={palette.textMuted} style={styles.icon} />
            <TextInput
                ref={ref}
                style={[styles.input, { color: palette.text, fontFamily: MUSIC_FONTS.body }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={palette.textMuted}
                clearButtonMode="while-editing"
                keyboardAppearance={theme.mode === 'dark' ? 'dark' : 'light'}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: SPACING.m,
        paddingVertical: Platform.OS === 'android' ? 6 : 8,
        minHeight: 48,
        borderWidth: 1,
    },
    icon: {
        marginRight: SPACING.xs,
        marginLeft: SPACING.xs,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: SPACING.s,
    },
});
