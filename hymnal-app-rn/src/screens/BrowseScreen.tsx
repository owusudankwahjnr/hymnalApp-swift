import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Layout } from '../components/Layout';
import { useSettings } from '../context/SettingsContext';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from '../components/SearchBar';

const placeholderImage = require('../../assets/images/music-placeholder.png');

const QUICK_CATS = ['Top Picks', 'New Releases', 'Podcasts', 'Mood', 'Charts'];

const FEATURED = [
    { id: 'f1', title: 'Daily Praise Mix', subtitle: 'Fresh hymns', image: null },
    { id: 'f2', title: 'Peaceful Night', subtitle: 'Soft worship', image: null },
    { id: 'f3', title: 'Morning Drive', subtitle: 'Uplifted', image: null },
];

const PODCASTS = [
    { id: 'p1', title: 'Grace Notes', subtitle: 'Weekly reflections', image: null },
    { id: 'p2', title: 'Choir Room', subtitle: 'Behind the songs', image: null },
    { id: 'p3', title: 'Sunday Prep', subtitle: 'Messages + music', image: null },
];

const MOODS = [
    { id: 'm1', title: 'Calm', image: null },
    { id: 'm2', title: 'Focus', image: null },
    { id: 'm3', title: 'Joy', image: null },
    { id: 'm4', title: 'Hope', image: null },
];

export const BrowseScreen = () => {
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState('');

    return (
        <Layout>
            <View style={styles.screen}>
                <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                    <Text style={[styles.title, { color: palette.text }]}>Search</Text>
                    <Text style={[styles.subtitle, { color: palette.textMuted }]}>Find songs and podcasts</Text>
                    <View style={styles.searchWrap}>
                        <SearchBar
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search songs, artists, podcasts"
                        />
                    </View>
                </View>

                <View style={styles.chipRow}>
                    {QUICK_CATS.map((label) => (
                        <View key={label} style={[styles.chip, { backgroundColor: palette.surface }]}> 
                            <Text style={[styles.chipText, { color: palette.text }]}>{label}</Text>
                        </View>
                    ))}
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={[styles.sectionHeader, { color: palette.text }]}>Top Results</Text>
                        <Text style={[styles.sectionAction, { color: palette.textMuted }]}>See all</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
                        {FEATURED.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.featureCard} activeOpacity={0.9}>
                                <Image source={item.image ? { uri: item.image } : placeholderImage} style={styles.featureImage} />
                                <Text style={[styles.featureTitle, { color: palette.text }]} numberOfLines={2}>{item.title}</Text>
                                <Text style={[styles.featureSubtitle, { color: palette.textMuted }]} numberOfLines={1}>{item.subtitle}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.sectionHeaderRow}>
                        <Text style={[styles.sectionHeader, { color: palette.text }]}>Browse All</Text>
                        <Text style={[styles.sectionAction, { color: palette.textMuted }]}>Show all</Text>
                    </View>
                    <View style={styles.moodGrid}>
                        {MOODS.map((item) => (
                            <TouchableOpacity key={item.id} style={[styles.moodTile, { backgroundColor: palette.surface }]} activeOpacity={0.9}>
                                <Image source={item.image ? { uri: item.image } : placeholderImage} style={styles.moodImage} />
                                <Text style={[styles.moodTitle, { color: palette.text }]}>{item.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.sectionHeaderRow}>
                        <Text style={[styles.sectionHeader, { color: palette.text }]}>Podcasts</Text>
                        <Text style={[styles.sectionAction, { color: palette.textMuted }]}>See all</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
                        {PODCASTS.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.podcastCard} activeOpacity={0.9}>
                                <Image source={item.image ? { uri: item.image } : placeholderImage} style={styles.podcastImage} />
                                <View style={styles.podcastText}>
                                    <Text style={[styles.podcastTitle, { color: palette.text }]} numberOfLines={1}>{item.title}</Text>
                                    <Text style={[styles.podcastSubtitle, { color: palette.textMuted }]} numberOfLines={1}>{item.subtitle}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </ScrollView>
            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 140,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    title: {
        fontSize: 34,
        fontFamily: MUSIC_FONTS.display,
    },
    subtitle: {
        marginTop: 6,
        fontSize: 14,
        fontFamily: MUSIC_FONTS.body,
    },
    searchWrap: {
        marginTop: 14,
    },
    chipRow: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        paddingBottom: 12,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    chipText: {
        fontFamily: MUSIC_FONTS.ui,
        fontSize: 12,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 22,
        marginBottom: 12,
    },
    sectionHeader: {
        fontSize: 20,
        fontFamily: MUSIC_FONTS.headline,
    },
    sectionAction: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.ui,
    },
    rail: {
        paddingHorizontal: 20,
        gap: 16,
    },
    featureCard: {
        width: 170,
    },
    featureImage: {
        width: 170,
        height: 170,
        borderRadius: 10,
        marginBottom: 10,
    },
    featureTitle: {
        fontFamily: MUSIC_FONTS.ui,
        fontSize: 13,
    },
    featureSubtitle: {
        fontFamily: MUSIC_FONTS.body,
        fontSize: 11,
        marginTop: 4,
    },
    moodGrid: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    moodTile: {
        width: '48%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    moodImage: {
        width: '100%',
        height: 90,
    },
    moodTitle: {
        fontFamily: MUSIC_FONTS.ui,
        fontSize: 13,
        padding: 10,
    },
    podcastCard: {
        width: 220,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    podcastImage: {
        width: '100%',
        height: 120,
    },
    podcastText: {
        padding: 12,
    },
    podcastTitle: {
        fontFamily: MUSIC_FONTS.ui,
        fontSize: 13,
    },
    podcastSubtitle: {
        fontFamily: MUSIC_FONTS.body,
        fontSize: 11,
        marginTop: 4,
    },
});
