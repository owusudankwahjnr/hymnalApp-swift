import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import withObservables from '@nozbe/with-observables';
import Hymn from '../db/models/Hymn';
import HymnBook from '../db/models/HymnBook';
import { SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    hymn: Hymn;
    hymnBook: HymnBook;
    isCurrent: boolean;
    showBadge?: boolean;
    onPress: () => void;
}

const VariantRowComponent: React.FC<Props> = ({ hymn, hymnBook, isCurrent, showBadge, onPress }) => {
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);
    const isPinned = hymnBook?.isPinned;

    return (
        <TouchableOpacity
            style={[
                styles.variantRow,
                { borderColor: palette.border },
                isCurrent && { borderColor: palette.border, backgroundColor: palette.surfaceMuted },
                isPinned && !isCurrent && { 
                    borderColor: palette.border, 
                    borderWidth: 1,
                    backgroundColor: palette.surfaceMuted,
                },
                showBadge && !isCurrent && !isPinned && { 
                    borderColor: palette.border, 
                    borderWidth: 1,
                }
            ]}
            onPress={onPress}
        >
            <LinearGradient colors={palette.rowGradient} style={StyleSheet.absoluteFill} pointerEvents="none" />
            <View style={{ flex: 1, marginRight: SPACING.s }}>
                <Text 
                    style={[
                        styles.variantTitle,
                        { color: palette.text },
                        isCurrent && { color: palette.text },
                        isPinned && !isCurrent && { color: palette.text },
                        showBadge && !isCurrent && !isPinned && { color: palette.text }
                    ]}
                    numberOfLines={2}
                >
                    {hymn.title}
                </Text>

                <Text style={[styles.variantSubtitle, { color: palette.textMuted, marginTop: 4 }]} numberOfLines={1}>
                    Hymn {hymn.number} • {hymnBook?.title || 'Unknown Book'}
                </Text>
            </View>

            <View style={styles.rightContent}>
                {isCurrent && (
                    <View style={[styles.statusCircle, { backgroundColor: palette.surfaceMuted }]}>
                        <Ionicons name="checkmark" size={16} color={palette.text} />
                    </View>
                )}
                {isPinned && !isCurrent && (
                    <View style={[styles.statusCircle, { backgroundColor: palette.surfaceMuted }]}>
                        <Ionicons name="pin" size={14} color={palette.text} />
                    </View>
                )}
                {showBadge && !isCurrent && !isPinned && (
                    <View style={[styles.statusCircle, { backgroundColor: palette.surfaceMuted }]}>
                        <Ionicons name="alert" size={16} color={palette.text} />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    variantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: 16,
        marginBottom: SPACING.s,
        borderWidth: 1,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    variantTitle: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
    },
    variantSubtitle: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.body,
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: SPACING.s,
    },
    statusCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export const VariantRow = withObservables(['hymn'], ({ hymn }: { hymn: Hymn }) => ({
    hymn,
    hymnBook: hymn.hymnBook,
}))(VariantRowComponent);
