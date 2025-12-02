import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

interface Props {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export const SearchBar = React.forwardRef<TextInput, Props>(({ value, onChangeText, placeholder = 'Search hymns...' }, ref) => {
    const { theme } = useSettings();

    return (
        <View style={[styles.container, { backgroundColor: theme.mode === 'dark' ? '#2C2C2E' : '#E5E5EA' }]}>
            <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.icon} />
            <TextInput
                ref={ref}
                style={[styles.input, { color: theme.text }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.textSecondary}
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
        borderRadius: 10,
        paddingHorizontal: SPACING.s,
        height: 36,
        margin: SPACING.m,
    },
    icon: {
        marginRight: SPACING.xs,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
});
