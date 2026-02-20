import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Layout } from '../components/Layout';
import { useSettings } from '../context/SettingsContext';
import { Ionicons } from '@expo/vector-icons';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';

export const LibraryScreen = () => {
    const navigation = useNavigation<any>();
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);

    const LibraryRow = ({ icon, title, subtitle, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; onPress?: () => void }) => (
        <TouchableOpacity
            style={[styles.row, { borderColor: palette.border, backgroundColor: palette.surface }]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <View style={[styles.rowIcon, { backgroundColor: palette.backgroundAlt }]}>
                <Ionicons name={icon} size={20} color={palette.textMuted} />
            </View>
            <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: palette.text }]}>{title}</Text>
                <Text style={[styles.rowSubtitle, { color: palette.textMuted }]}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
        </TouchableOpacity>
    );

    return (
        <Layout variant="library">
            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: palette.text }]}>Your Library</Text>
                    <Text style={[styles.headerSubtitle, { color: palette.textMuted }]}>
                        Music, podcasts, and hymnbooks
                    </Text>
                </View>

                <View style={styles.filterRow}>
                    {['Playlists', 'Podcasts', 'Albums', 'Artists', 'Hymns'].map((label) => (
                        <View key={label} style={[styles.filterChip, { backgroundColor: palette.surface }]}>
                            <Text style={[styles.filterText, { color: palette.text }]}>{label}</Text>
                        </View>
                    ))}
                </View>

                <Text style={[styles.sectionHeader, { color: palette.text }]}>Shortcuts</Text>
                <View style={styles.sectionList}>
                    <LibraryRow
                        icon="musical-notes"
                        title="Playlists"
                        subtitle="Curated sets and mixes"
                        onPress={() => navigation.navigate('Playlists')}
                    />
                    <LibraryRow
                        icon="mic"
                        title="Podcasts"
                        subtitle="Shows you follow"
                    />
                    <LibraryRow
                        icon="download"
                        title="Downloads"
                        subtitle="Available offline"
                    />
                </View>

                <Text style={[styles.sectionHeader, { color: palette.text }]}>Hymnbooks</Text>
                <View style={styles.sectionList}>
                    <LibraryRow
                        icon="heart"
                        title="Favorite Hymns"
                        subtitle="Liked hymnbook texts (no audio)"
                        onPress={() => navigation.navigate('Favorites')}
                    />
                    <LibraryRow
                        icon="book"
                        title="All Hymnbooks"
                        subtitle="Browse text-only collections"
                        onPress={() => navigation.navigate('Hymnbooks')}
                    />
                </View>
            </ScrollView>
        </Layout>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 34,
        fontFamily: MUSIC_FONTS.display,
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: MUSIC_FONTS.body,
        marginTop: 6,
    },
    filterRow: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 18,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
    },
    filterText: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.ui,
    },
    sectionHeader: {
        fontSize: 18,
        fontFamily: MUSIC_FONTS.headline,
        marginLeft: 20,
        marginBottom: 10,
        marginTop: 10,
    },
    listContent: {
        paddingBottom: 140,
    },
    sectionList: {
        paddingHorizontal: 16,
        marginBottom: 18,
        gap: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        marginRight: 15,
    },
    rowIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    rowText: {
        flex: 1,
    },
    rowTitle: {
        fontSize: 15,
        fontFamily: MUSIC_FONTS.ui,
    },
    rowSubtitle: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.body,
        marginTop: 4,
    },
});
