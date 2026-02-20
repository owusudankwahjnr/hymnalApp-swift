import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SectionList, ImageBackground, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Q } from '@nozbe/watermelondb';
import { Layout } from '../components/Layout';
import { useSettings } from '../context/SettingsContext';
import { usePlayer } from '../context/PlayerContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';

const placeholderImage = require('../../assets/images/music-placeholder.png');
const { width } = Dimensions.get('window');

export const HomeScreen = () => {
    const navigation = useNavigation<any>();
    const database = useDatabase();
    const { theme } = useSettings();
    const { playTrack } = usePlayer();
    const palette = getMusicPalette(theme.mode);
    const [sections, setSections] = useState<any[]>([]);
    const [heroTrack, setHeroTrack] = useState<any | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const books = await database.get('hymn_books').query().fetch();
                // Just for demo, we'll fetch random hymns as "Recently Played" or "Top Picks"
                const hymns = await database.get('hymns').query(Q.take(10)).fetch();

                setHeroTrack(hymns[0] || null);
                setSections([
                    {
                        title: 'Recently Played',
                        data: [hymns.slice(0, 5)], // Horizontal list item
                        renderItem: ({ item }: any) => <HorizontalHymnList data={item} />,
                        type: 'horizontal'
                    },
                    {
                        title: 'Your Library',
                        data: books,
                        renderItem: ({ item }: any) => <BookItem item={item} />,
                        type: 'vertical'
                    }
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const HeroCard = ({ track }: { track: any | null }) => {
        if (!track) return null;
        return (
            <Animated.View entering={FadeInUp.duration(500).springify()} style={styles.heroWrapper}>
                <TouchableOpacity
                    style={styles.heroCard}
                    activeOpacity={0.9}
                    onPress={() =>
                        playTrack({
                            id: track.id,
                            title: track.title,
                            artist: track.artist || 'Unknown Artist',
                            artwork: track.albumArt || null,
                            url: track.audioUrl || null,
                            duration: track.duration || 180,
                            lyrics: track.lyrics,
                        })
                    }
                >
                    <ImageBackground
                        source={track.albumArt ? { uri: track.albumArt } : placeholderImage}
                        style={styles.heroImage}
                        imageStyle={styles.heroImageStyle}
                    >
                        <LinearGradient
                            colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.6)']}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.heroContent}>
                            <Text style={[styles.heroEyebrow, { color: 'rgba(255,255,255,0.8)' }]}>Daily Hymn</Text>
                            <Text style={styles.heroTitle} numberOfLines={2}>
                                {track.title}
                            </Text>
                            <Text style={[styles.heroMeta, { color: 'rgba(255,255,255,0.75)' }]}>Hymn {track.number}</Text>
                            <View style={styles.heroActions}>
                                <View style={styles.heroPlayButton}>
                                    <Ionicons name="play" size={22} color="#FFFFFF" />
                                </View>
                                <Text style={styles.heroActionText}>Play now</Text>
                            </View>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const HorizontalHymnList = ({ data }: { data: any[] }) => (
        <FlatList
            horizontal
            data={data}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            renderItem={({ item, index }) => (
                <Animated.View entering={FadeInRight.duration(400).delay(index * 80).springify()}>
                    <TouchableOpacity 
                        style={[styles.horizontalItem, { borderColor: palette.border }]}
                        onPress={() => playTrack({
                            id: item.id,
                            title: item.title,
                            artist: item.artist || 'Unknown Artist',
                            artwork: item.albumArt || null,
                            url: item.audioUrl || null,
                            duration: item.duration || 180,
                            lyrics: item.lyrics,
                        })}
                        activeOpacity={0.85}
                    >
                        <ImageBackground source={item.albumArt ? { uri: item.albumArt } : placeholderImage} style={styles.horizontalImage} imageStyle={styles.horizontalImageStyle}>
                            <LinearGradient
                                colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.6)']}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={styles.playBadge}>
                                <Ionicons name="play" size={16} color="#FFFFFF" />
                            </View>
                        </ImageBackground>
                        <Text style={[styles.itemTitle, { color: palette.text }]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.itemSubtitle, { color: palette.textMuted }]}>Hymn {item.number}</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
            keyExtractor={item => item.id}
        />
    );

    const BookItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={[styles.bookItem, { borderColor: palette.border }]}
            onPress={() => navigation.navigate('HymnList', { 
                hymnBookId: item.id,
                hymnBookTitle: item.title 
            })}
            activeOpacity={0.85}
        >
            <View style={[styles.bookCover, { borderColor: palette.border }]}>
                {item.thumbnailPath ? (
                    <Image source={{ uri: item.thumbnailPath }} style={styles.bookImage} />
                ) : (
                    <LinearGradient
                        colors={[palette.accent, palette.accentSecondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                )}
                <View style={styles.bookIconBadge}>
                    <Ionicons name="book" size={16} color="#FFFFFF" />
                </View>
            </View>
            <View style={styles.bookInfo}>
                <Text style={[styles.bookTitle, { color: palette.text }]}>{item.title}</Text>
                <Text style={[styles.bookSubtitle, { color: palette.textMuted }]}>{item.hymnCount || 0} Songs</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
        </TouchableOpacity>
    );

    return (
        <Layout>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: palette.text }]}>Listen Now</Text>
                <Text style={[styles.headerSubtitle, { color: palette.textMuted }]}>Curated hymns and collections</Text>
            </View>
            <SectionList
                sections={sections}
                keyExtractor={(item, index) => item.id + index}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={[styles.sectionHeader, { color: palette.text }]}>{title}</Text>
                )}
                renderItem={({ item, section }) => {
                    if (section.type === 'horizontal') return <HorizontalHymnList data={item} />;
                    return <BookItem item={item} />;
                }}
                ListHeaderComponent={<HeroCard track={heroTrack} />}
                contentContainerStyle={{ paddingBottom: 100 }}
                stickySectionHeadersEnabled={false}
            />
        </Layout>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 34,
        fontFamily: MUSIC_FONTS.display,
        letterSpacing: 0.3,
    },
    headerSubtitle: {
        marginTop: 6,
        fontSize: 14,
        fontFamily: MUSIC_FONTS.body,
    },
    heroWrapper: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16,
    },
    heroCard: {
        borderRadius: 24,
        overflow: 'hidden',
        height: width * 0.54,
    },
    heroImage: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    heroImageStyle: {
        borderRadius: 24,
    },
    heroContent: {
        padding: 20,
    },
    heroEyebrow: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.ui,
        textTransform: 'uppercase',
        letterSpacing: 1.4,
        marginBottom: 8,
    },
    heroTitle: {
        fontSize: 24,
        fontFamily: MUSIC_FONTS.display,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    heroMeta: {
        fontSize: 14,
        fontFamily: MUSIC_FONTS.body,
        marginBottom: 12,
    },
    heroActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    heroPlayButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroActionText: {
        color: '#FFFFFF',
        fontFamily: MUSIC_FONTS.ui,
        fontSize: 14,
        letterSpacing: 0.3,
    },
    sectionHeader: {
        fontSize: 24,
        fontFamily: MUSIC_FONTS.headline,
        marginLeft: 24,
        marginTop: 28,
        marginBottom: 14,
        letterSpacing: 0.3,
    },
    horizontalItem: {
        marginRight: 16,
        width: 176,
        borderRadius: 18,
        borderWidth: 1,
        paddingBottom: 6,
    },
    horizontalImage: {
        width: 176,
        height: 176,
        borderRadius: 18,
        marginBottom: 10,
        backgroundColor: '#333',
        overflow: 'hidden',
    },
    horizontalImageStyle: {
        borderRadius: 18,
    },
    playBadge: {
        position: 'absolute',
        right: 12,
        top: 12,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
        letterSpacing: 0.2,
    },
    itemSubtitle: {
        fontSize: 13,
        fontFamily: MUSIC_FONTS.body,
        opacity: 0.7,
    },
    bookItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
        marginHorizontal: 16,
        marginBottom: 10,
    },
    bookCover: {
        width: 56,
        height: 56,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        marginRight: 15,
        justifyContent: 'flex-end',
    },
    bookImage: {
        width: '100%',
        height: '100%',
    },
    bookIconBadge: {
        position: 'absolute',
        right: 6,
        bottom: 6,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookInfo: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
    },
    bookSubtitle: {
        fontSize: 13,
        fontFamily: MUSIC_FONTS.body,
    },
});
