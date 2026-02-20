import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Dimensions, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import HymnBook from '../db/models/HymnBook';

interface Props {
    book: HymnBook;
    onPress: () => void;
    onPinPress?: (book: HymnBook) => void;
}

const { width } = Dimensions.get('window');
const TILE_WIDTH = (width - SPACING.m * 3) / 2;

export const CategoryTile: React.FC<Props> = ({ book, onPress, onPinPress }) => {
    const { theme } = useSettings();

    const handlePinPress = () => {
        Haptics.impactAsync(
            book.isPinned 
                ? Haptics.ImpactFeedbackStyle.Light 
                : Haptics.ImpactFeedbackStyle.Medium
        );
        onPinPress?.(book);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.card, 
                    { backgroundColor: theme.card },
                    book.isPinned && { 
                        borderWidth: 2, 
                        borderColor: theme.primary,
                    }
                ]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <View style={styles.topRow}>
                    <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}15` }]}>
                        <Ionicons name="book" size={32} color={theme.primary} />
                    </View>
                </View>

                <View style={styles.content}>
                    <Text 
                        style={[
                            styles.title, 
                            { color: theme.text },
                            book.isPinned && { color: theme.primary }
                        ]} 
                        numberOfLines={2}
                    >
                        {book.title}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        {book.hymnCount || 0} Hymns
                    </Text>
                </View>

                <View style={[styles.decorationCircle, { backgroundColor: theme.primary }]} />
            </TouchableOpacity>

            {/* Pin button - absolute position for independent touch handling */}
            <Pressable 
                onPress={handlePinPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.pinButtonWrapper}
            >
                <View 
                    style={[
                        styles.pinButton,
                        { backgroundColor: book.isPinned ? theme.primary : `${theme.textSecondary}15` }
                    ]}
                >
                    <Ionicons 
                        name={book.isPinned ? "pin" : "pin-outline"}
                        size={16} 
                        color={book.isPinned ? "#FFFFFF" : theme.textSecondary} 
                    />
                </View>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    card: {
        width: TILE_WIDTH,
        height: TILE_WIDTH * 1.1,
        borderRadius: 24,
        padding: SPACING.m,
        justifyContent: 'space-between',
        marginBottom: SPACING.m,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinButtonWrapper: {
        position: 'absolute',
        top: SPACING.m,
        right: SPACING.m,
        zIndex: 10,
    },
    pinButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
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
