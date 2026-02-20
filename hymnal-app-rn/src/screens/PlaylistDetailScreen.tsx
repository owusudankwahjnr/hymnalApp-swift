import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { usePlayer } from '../context/PlayerContext';
import { Layout } from '../components/Layout';
import { useSettings } from '../context/SettingsContext';
import { Ionicons } from '@expo/vector-icons';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';

export const PlaylistDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const database = useDatabase();
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);
    const { playTrack } = usePlayer();
    const { playlistId, title } = route.params;
    const [songs, setSongs] = useState<any[]>([]);

    useEffect(() => {
        const fetchSongs = async () => {
            // Fetch playlist items and join with Query to get hymns
            // WatermelonDB defines relations, we can use them.
            // But we need to fetch Playlist object first.
            try {
                const playlist = await database.get('playlists').find(playlistId) as any;
                const items = await playlist.playlistItems.fetch(); 
                
                // For each item, fetch the hymn
                const hymns = await Promise.all(items.map(async (item: any) => {
                    return await item.hymn.fetch();
                }));
                setSongs(hymns);
            } catch (e) {
                console.log("Error fetching playlist items", e);
            }
        };
        fetchSongs();
    }, [playlistId]);

    const playSong = (song: any) => {
         playTrack({
            id: song.id,
            title: song.title,
            artist: song.artist || 'Unknown Artist',
            artwork: song.albumArt || 'https://via.placeholder.com/150',
            url: song.audioUrl || null,
            duration: song.duration,
            lyrics: song.lyrics
        });
        navigation.navigate('Player');
    };

    const handlePlayAll = () => {
        if (songs.length > 0) {
            playSong(songs[0]);
        }
    };

    return (
        <Layout variant="library">
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color={palette.text} />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={[styles.headerTitle, { color: palette.text }]} numberOfLines={1}>{title}</Text>
                    <Text style={[styles.headerSubtitle, { color: palette.textMuted }]}>{songs.length} tracks</Text>
                </View>
                <TouchableOpacity onPress={handlePlayAll} style={[styles.playAllButton, { backgroundColor: palette.accent + '20' }]}>
                    <Ionicons name="play" size={18} color={palette.accent} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={songs}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item, index }) => (
                    <TouchableOpacity style={[styles.songItem, { borderColor: palette.border }]} onPress={() => playSong(item)} activeOpacity={0.85}>
                        <View style={[styles.indexBadge, { backgroundColor: palette.accent + '20' }]}>
                            <Text style={[styles.index, { color: palette.accent }]}>{index + 1}</Text>
                        </View>
                        <View style={styles.songInfo}>
                            <Text style={[styles.songTitle, { color: palette.text }]} numberOfLines={1}>{item.title}</Text>
                            <Text style={[styles.songSubtitle, { color: palette.textMuted }]} numberOfLines={1}>{item.artist || 'Unknown'}</Text>
                        </View>
                        <View style={[styles.moreButton, { backgroundColor: palette.glassStrong }]}>
                            <Ionicons name="ellipsis-horizontal" size={18} color={palette.textMuted} />
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: palette.textMuted }]}>No songs in this playlist.</Text>
                    </View>
                }
            />
        </Layout>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.16)',
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: MUSIC_FONTS.display,
    },
    headerSubtitle: {
        fontSize: 13,
        fontFamily: MUSIC_FONTS.body,
        marginTop: 4,
    },
    playAllButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        marginHorizontal: 16,
        marginBottom: 10,
    },
    index: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
    },
    indexBadge: {
        width: 34,
        height: 34,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    songInfo: {
        flex: 1,
    },
    songTitle: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
    },
    songSubtitle: {
        fontSize: 14,
        marginTop: 2,
        fontFamily: MUSIC_FONTS.body,
    },
    moreButton: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
        paddingHorizontal: 24,
    },
    emptyText: {
        fontSize: 15,
        fontFamily: MUSIC_FONTS.body,
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 120,
    }
});
