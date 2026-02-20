import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Layout } from '../components/Layout';
import { useSettings } from '../context/SettingsContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';

export const PlaylistScreen = () => {
    const navigation = useNavigation<any>();
    const database = useDatabase();
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);
    const [playlists, setPlaylists] = useState<any[]>([]);

    useEffect(() => {
        const fetchPlaylists = async () => {
             const items = await database.get('playlists').query().fetch();
             setPlaylists(items);
        };
        fetchPlaylists();
        // Subscribe to changes if possible, but basic fetch for now
    }, []);

    const createPlaylist = () => {
        Alert.prompt(
            "New Playlist",
            "Enter a name for this playlist",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Create",
                    onPress: async (name?: string) => {
                        if (name) {
                            await database.write(async () => {
                                await database.get('playlists').create((playlist: any) => {
                                    playlist.title = name;
                                    playlist.isCustom = true;
                                });
                            });
                            // Refresh
                            const items = await database.get('playlists').query().fetch();
                            setPlaylists(items);
                        }
                    }
                }
            ],
            "plain-text"
        );
    };

    const PlaylistItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={[styles.item, { borderColor: palette.border }]}
            onPress={() => navigation.navigate('PlaylistDetail', { playlistId: item.id, title: item.title })}
            activeOpacity={0.85}
        >
            <View style={[styles.imagePlaceholder, { borderColor: palette.border }]}>
                <LinearGradient colors={[palette.accent, palette.accentSecondary]} style={StyleSheet.absoluteFill} />
                <Ionicons name="musical-notes" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.info}>
                <Text style={[styles.title, { color: palette.text }]}>{item.title}</Text>
                <Text style={[styles.subtitle, { color: palette.textMuted }]}>Playlist</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
        </TouchableOpacity>
    );

    return (
        <Layout variant="library">
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color={palette.text} />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={[styles.headerTitle, { color: palette.text }]}>Playlists</Text>
                    <Text style={[styles.headerSubtitle, { color: palette.textMuted }]}>Build sets for every service</Text>
                </View>
                <TouchableOpacity onPress={createPlaylist} style={[styles.addButton, { backgroundColor: palette.accent + '20' }]}>
                    <Ionicons name="add" size={22} color={palette.accent} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={playlists}
                renderItem={({ item }) => <PlaylistItem item={item} />}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: palette.textMuted }]}>No playlists yet.</Text>
                        <TouchableOpacity onPress={createPlaylist} style={[styles.emptyButton, { backgroundColor: palette.accent }]}>
                            <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.emptyButtonText}>Create Playlist</Text>
                        </TouchableOpacity>
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
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        marginHorizontal: 16,
        marginBottom: 10,
    },
    imagePlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
        marginLeft: 15,
    },
    title: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: MUSIC_FONTS.body,
        marginTop: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
        paddingHorizontal: 24,
    },
    emptyText: {
        fontSize: 15,
        fontFamily: MUSIC_FONTS.body,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 16,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontFamily: MUSIC_FONTS.ui,
        fontSize: 14,
    },
    listContent: {
        paddingBottom: 120,
    },
});
