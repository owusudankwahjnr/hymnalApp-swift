import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { useSettings } from '../context/SettingsContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';

interface Props {
    visible: boolean;
    onClose: () => void;
    track: any;
}

export const AddToPlaylistModal = ({ visible, onClose, track }: Props) => {
    const database = useDatabase();
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);
    const [playlists, setPlaylists] = useState<any[]>([]);

    useEffect(() => {
        if (visible) {
            fetchPlaylists();
        }
    }, [visible]);

    const fetchPlaylists = async () => {
        const items = await database.get('playlists').query().fetch();
        setPlaylists(items);
    };

    const addToPlaylist = async (playlist: any) => {
        try {
            await database.write(async () => {
                // Check if already exists? For now just add.
                // We need to count items to set order
                const count = await database.get('playlist_items').query().fetchCount();
                
                await database.get('playlist_items').create((item: any) => {
                    item.playlist.set(playlist);
                    item.hymn.set(track); // Assuming track is a Hymn model or has ID matching one
                    item.order = count;
                });
            });
            onClose();
        } catch (e) {
            console.error("Error adding to playlist", e);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={[styles.overlay, { backgroundColor: palette.overlay }]}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.container, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                            <LinearGradient
                                colors={palette.cardGradient}
                                style={StyleSheet.absoluteFill}
                                pointerEvents="none"
                            />
                            <View style={styles.header}>
                                <Text style={[styles.title, { color: palette.text }]}>Add to Playlist</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={22} color={palette.text} />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={playlists}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={[styles.item, { borderColor: palette.divider }]} onPress={() => addToPlaylist(item)}>
                                        <View style={[styles.itemIcon, { backgroundColor: palette.accent + '22' }]}>
                                            <Ionicons name="musical-notes" size={18} color={palette.accent} />
                                        </View>
                                        <Text style={[styles.itemText, { color: palette.text }]}>{item.title}</Text>
                                        <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <View style={{ padding: 20, alignItems: 'center' }}>
                                        <Text style={{ color: palette.textMuted }}>No playlists found. Create one in Library first.</Text>
                                    </View>
                                }
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '60%',
        borderWidth: 1,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontFamily: MUSIC_FONTS.headline,
        letterSpacing: 0.2,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    itemIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    itemText: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.body,
        flex: 1,
    }
});
