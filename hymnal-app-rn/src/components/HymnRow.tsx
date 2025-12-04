import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import withObservables from '@nozbe/with-observables';
import { SPACING } from '../constants/theme';
import { useFavorites } from '../context/FavoritesContext';
import { useSettings } from '../context/SettingsContext';
import Hymn from '../db/models/Hymn';
import HymnBook from '../db/models/HymnBook';

interface Props {
    hymn: Hymn;
    hymnBook?: HymnBook;
    onPress: () => void;
    matchType?: 'verse' | 'chorus';
}

const HymnRowComponent: React.FC<Props> = ({ hymn, hymnBook, onPress, matchType }) => {
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const { theme } = useSettings();
    const isFav = isFavorite(hymn.id);

    const toggleFavorite = () => {
        if (isFav) {
            removeFavorite(hymn.id);
        } else {
            addFavorite(hymn.id);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.card }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.contentContainer}>
                <View style={[styles.numberBadge, { backgroundColor: theme.background }]}>
                    <Text style={[styles.numberText, { color: theme.primary }]}>{hymn.number}</Text>
                </View>

                <View style={styles.textContainer}>
                    {matchType && (
                        <View style={[styles.matchBadge, { backgroundColor: theme.primary + '20' }]}>
                            <Text style={[styles.matchText, { color: theme.primary }]}>
                                {matchType === 'verse' ? 'Verse Match' : 'Chorus Match'}
                            </Text>
                        </View>
                    )}
                    <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                        {hymn.title}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                        {hymnBook?.title || ''}
                    </Text>
                </View>

                <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
                    <Ionicons
                        name={isFav ? "heart" : "heart-outline"}
                        size={24}
                        color={isFav ? theme.error : theme.textSecondary}
                    />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export const HymnRow = withObservables(['hymn'], ({ hymn }: { hymn: Hymn }) => ({
    hymn: hymn.observe(),
    hymnBook: hymn.hymnBook.observe(),
}))(HymnRowComponent);

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.s,
        marginHorizontal: SPACING.m,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
    },
    numberBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    numberText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    textContainer: {
        flex: 1,
        marginRight: SPACING.s,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
    },
    favoriteButton: {
        padding: SPACING.xs,
    },
    matchBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 4,
    },
    matchText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});
