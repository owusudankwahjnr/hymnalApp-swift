import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../constants/theme';
import { HymnBook } from '../types';
import { useSettings } from '../context/SettingsContext';

interface Props {
    book: HymnBook;
    onPress: () => void;
}

export const HymnBookCard: React.FC<Props> = ({ book, onPress }) => {
    const { theme } = useSettings();

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}15` }]}>
                <Ionicons name="book" size={24} color={theme.primary} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]}>{book.title}</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{book.hymns?.length || 0} Hymns</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.s,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
    },
});
