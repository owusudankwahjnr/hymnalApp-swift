import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import Hymn from '../db/models/Hymn';
import { toTitleCase } from '../utils/stringUtils';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';

interface Props {
    hymn: Hymn;
    fontSize?: number;
}

export const HymnContent: React.FC<Props> = ({ hymn, fontSize = 20 }) => {
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);
    // Use the getter from the model which handles JSON parsing
    const content = hymn.parsedContent;
    const verses = content.verses || [];
    const chorus = content.chorus;

    return (
        <View style={styles.container}>
            <View style={[styles.header, { borderColor: palette.divider }]}>
                <Text style={[styles.title, { color: palette.text }]}>{toTitleCase(hymn.title)}</Text>
                <Text style={[styles.number, { color: palette.textMuted }]}>Hymn {hymn.number}</Text>
            </View>

            {verses
                .sort((a: any, b: any) => {
                    const aNum = parseInt(a.verse_name, 10);
                    const bNum = parseInt(b.verse_name, 10);
                    if (!isNaN(aNum) && !isNaN(bNum)) {
                        return aNum - bNum;
                    }
                    return a.verse_name.localeCompare(b.verse_name);
                })
                .map((verse: any, index: number) => (
                    <View key={index} style={[styles.section, { backgroundColor: palette.glassStrong, borderColor: palette.border }]}>
                        <Text style={[styles.verseTag, { color: palette.textMuted }]}>
                            {verse.verse_tag.toUpperCase()}
                        </Text>
                        <Text style={[styles.lyrics, { color: palette.text, fontSize: fontSize, lineHeight: fontSize * 1.6 }]}>
                            {verse.verse_content}
                        </Text>

                        {/* Show chorus after every verse if it exists */}
                        {chorus && (
                            <View style={[
                                styles.chorusContainer,
                                {
                                    backgroundColor: palette.surface,
                                    borderLeftColor: palette.border
                                }
                            ]}>
                                <Text style={[styles.chorusLabel, { color: palette.textMuted }]}>Chorus</Text>
                                <Text style={[styles.chorusLyrics, { color: palette.text, fontSize: fontSize, lineHeight: fontSize * 1.6 }]}>
                                    {chorus}
                                </Text>
                            </View>
                        )}
                    </View>
                ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingBottom: 120, // Extra space for bottom actions
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
        paddingBottom: SPACING.m,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 28,
        fontFamily: MUSIC_FONTS.display,
        textAlign: 'center',
        marginBottom: SPACING.xs,
        letterSpacing: -0.5,
    },
    number: {
        fontSize: 18,
        textAlign: 'center',
        fontFamily: MUSIC_FONTS.ui,
        marginBottom: SPACING.xl,
    },
    section: {
        marginBottom: SPACING.xl,
        padding: SPACING.l,
        borderRadius: 18,
        borderWidth: 1,
    },
    verseTag: {
        fontSize: 14,
        fontFamily: MUSIC_FONTS.ui,
        marginBottom: SPACING.s,
        textAlign: 'center',
        opacity: 0.6,
    },
    lyrics: {
        fontSize: 20,
        lineHeight: 32,
        textAlign: 'center',
        fontFamily: MUSIC_FONTS.body,
    },
    chorusContainer: {
        marginTop: SPACING.xl,
        padding: SPACING.l,
        borderRadius: 16,
        borderLeftWidth: 4,
    },
    chorusLabel: {
        fontSize: 14,
        fontFamily: MUSIC_FONTS.ui,
        marginBottom: SPACING.s,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    chorusLyrics: {
        fontSize: 20,
        lineHeight: 32,
        fontFamily: MUSIC_FONTS.body,
        fontStyle: 'italic',
        textAlign: 'left',
    },
});
