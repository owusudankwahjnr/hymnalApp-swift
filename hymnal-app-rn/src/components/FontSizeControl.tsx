import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

interface Props {
    fontSize: number;
    onChange: (size: number) => void;
}

export const FontSizeControl: React.FC<Props> = ({ fontSize, onChange }) => {
    const { theme } = useSettings();

    return (
        <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => onChange(Math.max(14, fontSize - 2))}
            >
                <Text style={[styles.label, { color: theme.primary }]}>A-</Text>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <TouchableOpacity
                style={styles.button}
                onPress={() => onChange(Math.min(32, fontSize + 2))}
            >
                <Text style={[styles.label, { color: theme.primary }]}>A+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderRadius: 20,
        borderWidth: 1,
        height: 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    button: {
        paddingHorizontal: SPACING.m,
        height: '100%',
        justifyContent: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        width: 1,
        height: '60%',
    },
});
