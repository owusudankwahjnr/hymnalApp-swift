import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Pressable, Share, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { usePlayer } from '../context/PlayerContext';
import { MusicBackground } from '../components/MusicBackground';
import { MUSIC_FONTS } from '../constants/musicTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QueueModal } from '../components/QueueModal';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

const placeholderImage = require('../../assets/images/music-placeholder.png');
const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 60;
const ARTWORK_SIZE = width - 72;

const TIMER_OPTIONS = [
    { label: 'Off', minutes: 0 },
    { label: '5 minutes', minutes: 5 },
    { label: '10 minutes', minutes: 10 },
    { label: '15 minutes', minutes: 15 },
    { label: '30 minutes', minutes: 30 },
    { label: '60 minutes', minutes: 60 },
];

export const PodcastPlayerModal = ({ navigation }: any) => {
    const { currentTrack, isPlaying, pause, resume, seekTo } = usePlayer();
    const { position, duration } = useProgress(500);
    const insets = useSafeAreaInsets();
    const [showQueue, setShowQueue] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showTimer, setShowTimer] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const playButtonScale = useSharedValue(1);
    const artworkScale = useSharedValue(1);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    useEffect(() => {
        playButtonScale.value = withSpring(isPlaying ? 1 : 0.95, { damping: 12, stiffness: 100 });
        artworkScale.value = withTiming(isPlaying ? 1 : 0.85, { duration: 300 });
    }, [isPlaying]);

    if (!currentTrack) return null;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const togglePlaybackRate = async () => {
        const rates = [1, 1.5, 2, 0.5];
        const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
        await TrackPlayer.setRate(nextRate);
        setPlaybackRate(nextRate);
    };

    const seekBy = (seconds: number) => {
        const next = Math.max(0, Math.min(duration, position + seconds));
        seekTo(next);
    };

    const handlePlayPause = () => {
        isPlaying ? pause() : resume();
    };

    const handleShare = async () => {
        try {
            const title = currentTrack?.title || 'Podcast';
            const artist = currentTrack?.artist ? ` — ${currentTrack.artist}` : '';
            await Share.share({ message: `${title}${artist}` });
        } catch (e) {
            // ignore
        }
    };

    const setSleepTimer = (minutes: number) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (minutes > 0) {
            timerRef.current = setTimeout(() => {
                pause();
            }, minutes * 60 * 1000);
        }
        setShowTimer(false);
    };

    const playButtonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: playButtonScale.value }],
    }));

    const artworkAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: artworkScale.value }],
    }));

    return (
        <MusicBackground variant="player" style={styles.container}>
            <Image
                source={currentTrack.artwork ? { uri: currentTrack.artwork } : placeholderImage}
                style={styles.backgroundImage}
                blurRadius={80}
            />
            <View style={styles.backdrop} />

            <View style={[styles.mainContainer, { paddingTop: insets.top + HEADER_HEIGHT }]}>
                <View style={styles.artworkLayer}>
                    <Animated.View style={artworkAnimatedStyle}>
                        <Image
                            source={currentTrack.artwork ? { uri: currentTrack.artwork } : placeholderImage}
                            style={styles.artwork}
                        />
                    </Animated.View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoText}>
                            <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
                            <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist || 'Unknown Host'}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.controlsLayer, { paddingBottom: insets.bottom + 20 }]}>
                    <View style={styles.progressSection}>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={duration}
                            value={position}
                            onSlidingComplete={seekTo}
                            minimumTrackTintColor="#FFFFFF"
                            maximumTrackTintColor="rgba(255,255,255,0.25)"
                            thumbTintColor="#FFFFFF"
                        />
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeText}>{formatTime(position)}</Text>
                            <Text style={styles.timeText}>{formatTime(duration)}</Text>
                        </View>
                    </View>

                    <View style={styles.controlsRow}>
                        <TouchableOpacity onPress={togglePlaybackRate} style={styles.sideControl}>
                            <Text style={styles.rateText}>{playbackRate}x</Text>
                        </TouchableOpacity>

                        <View style={styles.mainControls}>
                            <TouchableOpacity onPress={() => seekBy(-15)} style={styles.controlIcon}>
                                <Ionicons name="play-back" size={26} color="#fff" />
                                <Text style={styles.seekLabel}>15</Text>
                            </TouchableOpacity>
                            <Animated.View style={playButtonAnimatedStyle}>
                                <TouchableOpacity onPress={handlePlayPause} style={styles.playIcon}>
                                    <Ionicons name={isPlaying ? "pause" : "play"} size={48} color="#fff" />
                                </TouchableOpacity>
                            </Animated.View>
                            <TouchableOpacity onPress={() => seekBy(15)} style={styles.controlIcon}>
                                <Ionicons name="play-forward" size={26} color="#fff" />
                                <Text style={styles.seekLabel}>15</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => setShowTimer(true)} style={styles.sideControl}>
                            <Ionicons name="timer-outline" size={22} color="rgba(255,255,255,0.85)" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomRow}>
                        <TouchableOpacity style={styles.outputButton} activeOpacity={0.85}>
                            <Ionicons name="headset" size={18} color="rgba(255,255,255,0.85)" />
                            <Text style={styles.outputText}>Output</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleShare} style={styles.bottomIcon}>
                            <Ionicons name="share-outline" size={22} color="rgba(255,255,255,0.85)" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowQueue(true)} style={styles.bottomIcon}>
                            <Ionicons name="list" size={22} color="rgba(255,255,255,0.85)" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                    <Ionicons name="chevron-down" size={28} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>PODCAST</Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            <QueueModal visible={showQueue} onClose={() => setShowQueue(false)} />

            <Modal visible={showTimer} transparent animationType="fade" onRequestClose={() => setShowTimer(false)}>
                <Pressable style={styles.timerOverlay} onPress={() => setShowTimer(false)}>
                    <Pressable style={styles.timerSheet} onPress={() => {}}>
                        <Text style={styles.timerTitle}>Sleep Timer</Text>
                        {TIMER_OPTIONS.map((opt) => (
                            <TouchableOpacity key={opt.label} style={styles.timerItem} onPress={() => setSleepTimer(opt.minutes)}>
                                <Text style={styles.timerText}>{opt.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </Pressable>
                </Pressable>
            </Modal>
        </MusicBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    mainContainer: {
        flex: 1,
        position: 'relative',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 10,
        zIndex: 50,
    },
    headerIcon: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.ui,
        color: 'rgba(255,255,255,0.85)',
        letterSpacing: 0.8,
    },
    headerSpacer: {
        width: 40,
    },
    artworkLayer: {
        position: 'absolute',
        top: HEADER_HEIGHT + 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1,
    },
    artwork: {
        width: ARTWORK_SIZE,
        height: ARTWORK_SIZE,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.5,
        shadowRadius: 16,
    },
    infoRow: {
        marginTop: 24,
        paddingHorizontal: 24,
        width: '100%',
    },
    infoText: {
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 22,
        fontFamily: MUSIC_FONTS.ui,
        color: '#fff',
        fontWeight: '700',
    },
    artist: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.body,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 6,
    },
    controlsLayer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        paddingHorizontal: 24,
    },
    progressSection: {
        marginBottom: 20,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -10,
    },
    timeText: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.ui,
        color: 'rgba(255,255,255,0.6)',
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    sideControl: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    rateText: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.ui,
        color: '#fff',
    },
    mainControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 40,
    },
    controlIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    seekLabel: {
        position: 'absolute',
        bottom: 6,
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        fontFamily: MUSIC_FONTS.ui,
    },
    playIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    outputButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    outputText: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.ui,
        color: 'rgba(255,255,255,0.85)',
    },
    bottomIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    timerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    timerSheet: {
        backgroundColor: '#1b1b1b',
        borderRadius: 16,
        padding: 20,
        gap: 10,
    },
    timerTitle: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
        color: '#fff',
        marginBottom: 6,
    },
    timerItem: {
        paddingVertical: 10,
    },
    timerText: {
        fontSize: 14,
        fontFamily: MUSIC_FONTS.body,
        color: 'rgba(255,255,255,0.85)',
    },
});
