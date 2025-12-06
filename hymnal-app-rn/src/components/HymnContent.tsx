import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import Hymn from '../db/models/Hymn';
import { toTitleCase } from '../utils/stringUtils';

interface Props {
    hymn: Hymn;
}

export const HymnContent: React.FC<Props> = ({ hymn }) => {
    const { theme } = useSettings();
    // Use the getter from the model which handles JSON parsing
    const content = hymn.parsedContent;
    const verses = content.verses || [];
    const chorus = content.chorus;

    return (
        <View style={styles.container}>

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
                    <View key={index} style={styles.section}>
                        <Text style={[styles.verseTag, { color: theme.textSecondary }]}>
                            {verse.verse_tag.toUpperCase()}
                        </Text>
                        <Text style={[styles.lyrics, { color: theme.text }]}>
                            {verse.verse_content}
                        </Text>

                        {/* Show chorus after every verse if it exists */}
                        {chorus && (
                            <View style={[
                                styles.chorusContainer,
                                {
                                    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                    borderLeftColor: theme.primary
                                }
                            ]}>
                                <Text style={[styles.chorusLabel, { color: theme.primary }]}>Chorus</Text>
                                <Text style={[styles.chorusLyrics, { color: theme.text }]}>
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
    title: {
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: SPACING.xs,
        letterSpacing: -0.5,
    },
    number: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: SPACING.xl,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    verseTag: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: SPACING.s,
        textAlign: 'center',
        opacity: 0.6,
    },
    lyrics: {
        fontSize: 20,
        lineHeight: 32,
        textAlign: 'center',
        fontWeight: '400',
    },
    chorusContainer: {
        marginTop: SPACING.xl,
        padding: SPACING.l,
        borderRadius: 16,
        borderLeftWidth: 4,
    },
    chorusLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: SPACING.s,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    chorusLyrics: {
        fontSize: 20,
        lineHeight: 32,
        fontStyle: 'italic',
        textAlign: 'left',
    },
});
