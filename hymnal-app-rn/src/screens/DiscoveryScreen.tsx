import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Q } from '@nozbe/watermelondb';
import { Layout } from '../components/Layout';
import { useSettings } from '../context/SettingsContext';
import { usePlayer } from '../context/PlayerContext';
import { Ionicons } from '@expo/vector-icons';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const placeholderImage = require('../../assets/images/music-placeholder.png');
const demoAudio = require('../../assets/audio/my-love-westlife.mp3');
const podcastPlaceholder = require('../../assets/images/music-placeholder.png');

const PODCASTS = [
    { id: 'pod-1', title: 'Grace Notes', host: 'KOD Audio', artwork: null, duration: 1800 },
    { id: 'pod-2', title: 'Sunday Prep', host: 'Hymnal Studio', artwork: null, duration: 2400 },
    { id: 'pod-3', title: 'Choir Room', host: 'The Ensemble', artwork: null, duration: 2100 },
    { id: 'pod-4', title: 'Morning Devotion', host: 'Daily Hymns', artwork: null, duration: 1500 },
];

// Demo LRC content for testing lyric sync feature
const DEMO_LRC = `[00:00.00]
[00:27.50]An empty street, an empty house
[00:30.90]A hole inside my heart
[00:34.30]I'm all alone, the rooms are getting smaller
[00:40.90]I wonder how, I wonder why
[00:44.20]I wonder where they are
[00:47.60]The days we had, the songs we sang together
[00:54.20]And all my love, I'm holding on forever
[01:01.00]Reaching for the love that seems so far
[01:06.80]So I say a little prayer
[01:10.20]And hope my dreams will take me there
[01:13.50]Where the skies are blue to see you once again
[01:20.20]Over seas from coast to coast
[01:23.40]To find the place I love the most
[01:26.90]Where the fields are green to see you once again
[01:37.60]I try to read, I go to work
[01:41.00]I'm laughing with my friends
[01:44.20]But I can't stop to keep myself from thinking
[01:51.00]I wonder how, I wonder why
[01:54.30]I wonder where they are
[01:57.60]The days we had, the songs we sang together
[02:04.00]And all my love, I'm holding on forever
[02:10.90]Reaching for the love that seems so far
[02:16.80]So I say a little prayer
[02:20.10]And hope my dreams will take me there
[02:23.40]Where the skies are blue to see you once again
[02:30.20]Over seas from coast to coast
[02:33.40]To find the place I love the most
[02:36.70]Where the fields are green to see you once again
[02:42.60]To hold you in my arms
[02:45.90]To promise you my love
[02:49.20]To tell you from the heart
[02:52.60]You're all I'm thinking of
[03:04.40]Reaching for the love that seems so far
[03:09.60]So I say a little prayer
[03:13.50]And hope my dreams will take me there
[03:16.80]Where the skies are blue to see you once again
[03:23.60]Over seas from coast to coast
[03:26.80]To find the place I love the most
[03:30.20]Where the fields are green to see you once again
[03:37.60]Say a little prayer
[03:40.80]Dreams will take me there
[03:43.60]Where the skies are blue to see you once again
[03:50.30]Over seas from coast to coast
[03:53.40]To find the place I love the most
[03:56.70]Where the fields are green to see you once again
`;

export const DiscoveryScreen = () => {
    const database = useDatabase();
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);
    const { playTrack } = usePlayer();
    const navigation = useNavigation<any>();
    const [featured, setFeatured] = useState<any[]>([]);
    const [recent, setRecent] = useState<any[]>([]);
    const [activeFilter, setActiveFilter] = useState<'All' | 'Music' | 'Podcasts'>('All');
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const featuredHymns = await database.get('hymns').query(Q.take(10)).fetch();
                const recentHymns = await database.get('hymns').query(Q.take(10)).fetch(); // In real app, query by date
                setFeatured(featuredHymns);
                setRecent(recentHymns);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    const quickMixes = useMemo(() => {
        const combined = [...featured, ...recent].slice(0, 6);
        return combined;
    }, [featured, recent]);

    const showMusic = activeFilter !== 'Podcasts';
    const showPodcasts = activeFilter !== 'Music';

    const HorizontalHymnList = ({ data }: { data: any[] }) => (
        <FlatList
            horizontal
            data={data}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={({ item, index }) => (
                <TouchableOpacity 
                    style={styles.railCard}
                    onPress={() => {
                        playTrack({
                            id: item.id,
                            title: item.title,
                            artist: item.artist || 'Unknown Artist',
                            artwork: item.albumArt || null,
                            url: item.audioUrl || null,
                            duration: item.duration || 180,
                            lyrics: item.lyrics,
                            mediaType: 'music',
                        });
                    }}
                    activeOpacity={0.88}
                >
                    <Image 
                        source={item.albumArt ? { uri: item.albumArt } : placeholderImage} 
                        style={styles.railImage} 
                    />
                    <Text style={[styles.railTitle, { color: palette.text }]} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text style={[styles.railSubtitle, { color: palette.textMuted }]} numberOfLines={1}>
                        {item.artist || `Hymn ${item.number}`}
                    </Text>
                </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
        />
    );

    const QuickMixGrid = () => (
        <View style={styles.quickGrid}>
            {quickMixes.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    style={[styles.quickTile, { backgroundColor: palette.surface }]}
                    onPress={() => {
                        playTrack({
                            id: item.id,
                            title: item.title,
                            artist: item.artist || 'Unknown Artist',
                            artwork: item.albumArt || null,
                            url: item.audioUrl || null,
                            duration: item.duration || 180,
                            lyrics: item.lyrics,
                            mediaType: 'music',
                        });
                    }}
                    activeOpacity={0.85}
                >
                    <Image
                        source={item.albumArt ? { uri: item.albumArt } : placeholderImage}
                        style={styles.quickImage}
                    />
                    <View style={styles.quickText}>
                        <Text style={[styles.quickTitle, { color: palette.text }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={[styles.quickSubtitle, { color: palette.textMuted }]} numberOfLines={1}>
                            {item.artist || `Hymn ${item.number}`}
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    const PodcastRail = ({ data }: { data: typeof PODCASTS }) => (
        <FlatList
            horizontal
            data={data}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.podcastCard}
                    onPress={async () => {
                        await playTrack({
                            id: item.id,
                            title: item.title,
                            artist: item.host,
                            artwork: item.artwork || null,
                            audioUrl: demoAudio,
                            duration: item.duration,
                            mediaType: 'podcast',
                        });
                        navigation.navigate('PodcastPlayer');
                    }}
                    activeOpacity={0.88}
                >
                    <Image
                        source={item.artwork ? { uri: item.artwork } : podcastPlaceholder}
                        style={styles.podcastImage}
                    />
                    <Text style={[styles.podcastTitle, { color: palette.text }]} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text style={[styles.podcastSubtitle, { color: palette.textMuted }]} numberOfLines={1}>
                        {item.host}
                    </Text>
                </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
        />
    );

    return (
        <Layout>
            <View style={styles.screen}>
                <View style={[styles.topRow, { paddingTop: Math.max(insets.top, 16) }]}>
                    <TouchableOpacity
                        style={[styles.avatar, { backgroundColor: palette.surface }]}
                        onPress={() => navigation.navigate('Settings')}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="person" size={18} color={palette.text} />
                    </TouchableOpacity>
                    <View style={styles.chipRow}>
                        {(['All', 'Music', 'Podcasts'] as const).map((label) => {
                            const isActive = activeFilter === label;
                            return (
                                <TouchableOpacity
                                    key={label}
                                    style={[
                                        styles.chip,
                                        { backgroundColor: isActive ? palette.accent : palette.surface },
                                    ]}
                                    onPress={() => setActiveFilter(label)}
                                    activeOpacity={0.85}
                                >
                                    <Text style={[styles.chipText, { color: isActive ? '#0B0C0E' : palette.text }]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: palette.text }]}>{greeting}</Text>
                        <Text style={[styles.headerSubtitle, { color: palette.textMuted }]}>Discover something new today</Text>
                    </View>
                    {showMusic && (
                        <>
                            {/* Demo Lyric Sync Button */}
                            <TouchableOpacity
                                style={styles.demoButton}
                                onPress={() => {
                                    playTrack({
                                        id: 'demo-lyric-sync',
                                        title: 'My Love',
                                        artist: 'Westlife',
                                        artwork: null,
                                        audioUrl: demoAudio,
                                        duration: 257,
                                        lyrics: DEMO_LRC,
                                        mediaType: 'music',
                                    });
                                }}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={['#FF2D55', '#FF375F']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.demoButtonGradient}
                                >
                                    <Ionicons name="musical-notes" size={20} color="#fff" />
                                    <Text style={styles.demoButtonText}>Demo Lyric Sync</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <QuickMixGrid />

                            <View style={styles.sectionHeaderRow}>
                                <Text style={[styles.sectionHeader, { color: palette.text }]}>Soundtrack your night</Text>
                                <Text style={[styles.sectionAction, { color: palette.textMuted }]}>Show all</Text>
                            </View>
                            <HorizontalHymnList data={featured} />

                            <View style={styles.sectionHeaderRow}>
                                <Text style={[styles.sectionHeader, { color: palette.text }]}>Recents</Text>
                                <Text style={[styles.sectionAction, { color: palette.textMuted }]}>Show all</Text>
                            </View>
                            <HorizontalHymnList data={recent} />
                        </>
                    )}

                    {showPodcasts && (
                        <>
                            <View style={styles.sectionHeaderRow}>
                                <Text style={[styles.sectionHeader, { color: palette.text }]}>Podcasts</Text>
                                <Text style={[styles.sectionAction, { color: palette.textMuted }]}>Show all</Text>
                            </View>
                            <PodcastRail data={PODCASTS} />
                        </>
                    )}
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
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 54,
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipRow: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 18,
    },
    chipText: {
        fontSize: 13,
        fontFamily: MUSIC_FONTS.ui,
    },
    header: {
        paddingTop: 16,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 34,
        fontFamily: MUSIC_FONTS.display,
        letterSpacing: 0.4,
    },
    headerSubtitle: {
        marginTop: 6,
        fontSize: 14,
        fontFamily: MUSIC_FONTS.body,
    },
    quickGrid: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 22,
    },
    quickTile: {
        width: '48%',
        borderRadius: 8,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
    },
    quickImage: {
        width: 56,
        height: 56,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    quickText: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    quickTitle: {
        fontFamily: MUSIC_FONTS.ui,
        fontSize: 13,
    },
    quickSubtitle: {
        fontFamily: MUSIC_FONTS.body,
        fontSize: 11,
        marginTop: 2,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 20,
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
    railCard: {
        marginRight: 16,
        width: 150,
    },
    railImage: {
        width: 150,
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
    },
    railTitle: {
        fontFamily: MUSIC_FONTS.ui,
        fontSize: 13,
        lineHeight: 18,
    },
    railSubtitle: {
        fontFamily: MUSIC_FONTS.body,
        fontSize: 11,
        marginTop: 4,
    },
    podcastCard: {
        marginRight: 16,
        width: 180,
    },
    podcastImage: {
        width: 180,
        height: 120,
        borderRadius: 8,
        marginBottom: 10,
    },
    podcastTitle: {
        fontFamily: MUSIC_FONTS.ui,
        fontSize: 13,
        lineHeight: 18,
    },
    podcastSubtitle: {
        fontFamily: MUSIC_FONTS.body,
        fontSize: 11,
        marginTop: 4,
    },
    demoButton: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 14,
        overflow: 'hidden',
    },
    demoButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 10,
    },
    demoButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
        fontWeight: '600',
    },
});
