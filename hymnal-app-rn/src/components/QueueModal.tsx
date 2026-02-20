import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image } from 'react-native';
import TrackPlayer, { Track, useTrackPlayerEvents, Event } from 'react-native-track-player';
import { useSettings } from '../context/SettingsContext';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const placeholderImage = require('../../assets/images/music-placeholder.png');

interface Props {
    visible: boolean;
    onClose: () => void;
}

export const QueueModal = ({ visible, onClose }: Props) => {
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);
    const { currentTrack } = usePlayer();
    const [queue, setQueue] = useState<Track[]>([]);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            loadQueue();
        }
    }, [visible]);

    useTrackPlayerEvents([Event.PlaybackQueueEnded, Event.PlaybackTrackChanged], async () => {
        if (visible) loadQueue();
    });

    const loadQueue = async () => {
        const tracks = await TrackPlayer.getQueue();
        setQueue(tracks);
    };

    const playItem = async (index: number) => {
        await TrackPlayer.skip(index);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: palette.background, paddingTop: Math.max(insets.top, 12) }]}>
                <View
                    style={[
                        styles.handle,
                        { backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)' }
                    ]}
                />

                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, { color: palette.text }]}>Queue</Text>
                        <Text style={[styles.subtitle, { color: palette.textMuted }]}>Playing Liked Songs</Text>
                    </View>
                    <TouchableOpacity style={[styles.editButton, { backgroundColor: palette.surface }]} activeOpacity={0.85}>
                        <Text style={[styles.editText, { color: palette.text }]}>Edit</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={queue}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item, index }) => {
                        const isCurrent = currentTrack?.id === item.id;
                        return (
                            <TouchableOpacity 
                                style={styles.item}
                                onPress={() => playItem(index)}
                                activeOpacity={0.85}
                            >
                                <View style={styles.artworkWrapper}>
                                    <Image source={item.artwork?.toString() ? { uri: item.artwork.toString() } : placeholderImage} style={styles.artwork} />
                                </View>
                                <View style={styles.info}>
                                    <Text style={[styles.itemTitle, { color: isCurrent ? palette.accent : palette.text }]} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <Text style={[styles.itemArtist, { color: palette.textMuted }]} numberOfLines={1}>
                                        {item.artist}
                                    </Text>
                                </View>
                                {isCurrent ? (
                                    <View style={[styles.playIndicator, { backgroundColor: palette.surface }]}>
                                        <Ionicons name="play" size={18} color={palette.text} />
                                    </View>
                                ) : (
                                    <Ionicons name="reorder-three" size={22} color={palette.textMuted} />
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />

                <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                    <TouchableOpacity style={[styles.bottomAction, { backgroundColor: palette.surface }]} activeOpacity={0.85}>
                        <Ionicons name="shuffle" size={20} color={palette.accent} />
                        <Text style={[styles.bottomLabel, { color: palette.accent }]}>Shuffle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.bottomAction, { backgroundColor: palette.surface }]} activeOpacity={0.85}>
                        <Ionicons name="repeat" size={20} color={palette.text } />
                        <Text style={[styles.bottomLabel, { color: palette.text }]} >Repeat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.bottomAction, { backgroundColor: palette.surface }]} activeOpacity={0.85}>
                        <Ionicons name="timer-outline" size={20} color={palette.text } />
                        <Text style={[styles.bottomLabel, { color: palette.text }]} >Timer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    handle: {
        alignSelf: 'center',
        width: 38,
        height: 4,
        borderRadius: 2,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 14,
    },
    title: {
        fontSize: 22,
        fontFamily: MUSIC_FONTS.headline,
        letterSpacing: 0.3,
    },
    subtitle: {
        fontSize: 13,
        fontFamily: MUSIC_FONTS.body,
        marginTop: 4,
    },
    editButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
    },
    editText: {
        fontSize: 13,
        fontFamily: MUSIC_FONTS.ui,
    },
    listContent: {
        paddingTop: 6,
        paddingBottom: 120,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    artworkWrapper: {
        width: 52,
        height: 52,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
        backgroundColor: '#333',
    },
    artwork: {
        width: '100%',
        height: '100%',
    },
    info: {
        flex: 1,
        marginRight: 10,
    },
    itemTitle: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
    },
    itemArtist: {
        fontSize: 14,
        marginTop: 2,
        fontFamily: MUSIC_FONTS.body,
    },
    playIndicator: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        backgroundColor: 'rgba(0,0,0,0.35)',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    bottomAction: {
        flex: 1,
        marginHorizontal: 6,
        borderRadius: 14,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    bottomLabel: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.ui,
    },
});
