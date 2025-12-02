import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import HymnBook from '../db/models/HymnBook';

interface Props {
    book: HymnBook;
    onPress: () => void;
}

const { width } = Dimensions.get('window');
const TILE_WIDTH = (width - SPACING.m * 3) / 2; // 2 columns with spacing

export const CategoryTile: React.FC<Props> = ({ book, onPress }) => {
    const { theme } = useSettings();

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}15` }]}>
                <Ionicons name="book" size={32} color={theme.primary} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{book.title}</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{book.hymnCount || 0} Hymns</Text>
            </View>
            <View style={[styles.decorationCircle, { backgroundColor: theme.primary }]} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: TILE_WIDTH,
        height: TILE_WIDTH * 1.1, // Slightly taller than wide
        borderRadius: 20,
        padding: SPACING.m,
        justifyContent: 'space-between',
        marginBottom: SPACING.m,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
        position: 'relative',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        marginTop: SPACING.s,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
        lineHeight: 22,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    decorationCircle: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        opacity: 0.05,
    },
});
