import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import withObservables from '@nozbe/with-observables';
import { SPACING } from '../constants/theme';
import { useFavorites } from '../context/FavoritesContext';
import { useSettings } from '../context/SettingsContext';
import Hymn from '../db/models/Hymn';
import HymnBook from '../db/models/HymnBook';
import { toTitleCase } from '../utils/stringUtils';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';

interface Props {
    hymn: Hymn;
    hymnBook?: HymnBook;
    onPress: () => void;
    matchType?: 'verse' | 'chorus';
}

const HymnRowComponent: React.FC<Props> = ({ hymn, hymnBook, onPress, matchType }) => {
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);
    const isFav = isFavorite(hymn.id);

    const toggleFavorite = () => {
        if (isFav) {
            removeFavorite(hymn.id);
        } else {
            addFavorite(hymn.id);
        }
    };

    return (
        <Animated.View entering={FadeInUp.duration(450).springify()} style={styles.wrapper}>
            <TouchableOpacity
                style={[styles.container, { borderColor: palette.border }]}
                onPress={onPress}
                activeOpacity={0.85}
            >
                <LinearGradient colors={palette.cardGradient} style={StyleSheet.absoluteFill} pointerEvents="none" />
                <View style={styles.contentContainer}>
                    <View style={[styles.cover, { borderColor: palette.border, backgroundColor: palette.surfaceMuted }]}>
                        <Text style={[styles.coverNumber, { color: palette.text }]}>{hymn.number}</Text>
                        <Ionicons name="book" size={18} color={palette.textMuted} />
                    </View>

                    <View style={styles.textContainer}>
                        {matchType && (
                            <View style={[styles.matchBadge, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
                                <Text style={[styles.matchText, { color: palette.textMuted }]}>
                                    {matchType === 'verse' ? 'Verse Match' : 'Chorus Match'}
                                </Text>
                            </View>
                        )}
                        <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>
                            {toTitleCase(hymn.title)}
                        </Text>
                        <Text style={[styles.subtitle, { color: palette.textMuted }]} numberOfLines={1}>
                            {hymnBook?.title || ''}
                        </Text>
                    </View>

                    <TouchableOpacity onPress={toggleFavorite} style={[styles.favoriteButton, { backgroundColor: palette.surfaceMuted }]}>
                        <Ionicons
                            name={isFav ? "heart" : "heart-outline"}
                            size={20}
                            color={isFav ? palette.text : palette.textMuted}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export const HymnRow = withObservables(['hymn'], ({ hymn }: { hymn: Hymn }) => ({
    hymn: hymn.observe(),
    hymnBook: hymn.hymnBook.observe(),
}))(HymnRowComponent);

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: SPACING.s,
        marginHorizontal: SPACING.m,
    },
    container: {
        borderRadius: 20,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
        overflow: 'hidden',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        gap: SPACING.s,
    },
    cover: {
        width: 58,
        height: 58,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        overflow: 'hidden',
    },
    coverNumber: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
        marginBottom: 2,
    },
    textContainer: {
        flex: 1,
        marginRight: SPACING.s,
    },
    title: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
        letterSpacing: 0.2,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.body,
    },
    favoriteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    matchBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginBottom: 6,
        borderWidth: 1,
    },
    matchText: {
        fontSize: 10,
        fontFamily: MUSIC_FONTS.ui,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
});
