import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Modal, Pressable, Share, ScrollView } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming, 
    interpolate,
    Extrapolation
} from 'react-native-reanimated';
import { usePlayer } from '../context/PlayerContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import TrackPlayer, { Track, useProgress } from 'react-native-track-player';
import { LyricsView } from '../components/LyricsView';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal';
import { QueueModal } from '../components/QueueModal';
import { MusicBackground } from '../components/MusicBackground';
import { MUSIC_FONTS } from '../constants/musicTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView, TapGestureHandler } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import MaskedView from '@react-native-masked-view/masked-view';

const placeholderImage = require('../../assets/images/music-placeholder.png');
const { width, height } = Dimensions.get('window');

// Constants for layout stability
const HEADER_HEIGHT = 60;
const CONTROLS_HEIGHT = 220; // Fixed height for bottom controls area
const ARTWORK_SIZE = width - 72;

export const PlayerModal = ({ navigation }: any) => {
    const { currentTrack, isPlaying, pause, resume, seekTo } = usePlayer();
    const { position, duration } = useProgress(200);
    const [showLyrics, setShowLyrics] = useState(false);
    const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
    const [isLiked, setIsLiked] = useState(false);
    const [showHeaderDetails, setShowHeaderDetails] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const originalQueueRef = useRef<Track[] | null>(null);
    const insets = useSafeAreaInsets();
    
    // Animation Values
    const lyricsOpacity = useSharedValue(0);
    const playButtonScale = useSharedValue(1);
    const artworkScale = useSharedValue(1);
    const controlsOpacity = useSharedValue(1);

    // Animate play button based on isPlaying state
    useEffect(() => {
        playButtonScale.value = withSpring(isPlaying ? 1 : 0.95, { damping: 12, stiffness: 100 });
        artworkScale.value = withTiming(isPlaying ? 1 : 0.85, { duration: 300 });
    }, [isPlaying]);

    // Handle Lyrics Toggle
    useEffect(() => {
        if (showLyrics) {
            lyricsOpacity.value = withTiming(1, { duration: 300 });
        } else {
            lyricsOpacity.value = withTiming(0, { duration: 300 });
        }
    }, [showLyrics]);

    useEffect(() => {
        if (!showLyrics) {
            setControlsVisible(true);
        }
    }, [showLyrics]);

    useEffect(() => {
        const target = showLyrics ? (controlsVisible ? 1 : 0) : 1;
        controlsOpacity.value = withTiming(target, { duration: 120 });
    }, [showLyrics, controlsVisible]);

    if (!currentTrack) return null;
    const artistName = currentTrack.artist || 'Unknown Artist';
    const showHeaderMeta = showLyrics || showHeaderDetails;
    const topSectionHeight = Math.max(height - 80, 0);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const skipToPrevious = async () => {
        try { await TrackPlayer.skipToPrevious(); } catch (e) {}
    };

    const skipToNext = async () => {
        try { await TrackPlayer.skipToNext(); } catch (e) {}
    };

    const toggleShuffle = async () => {
        const nextShuffle = !isShuffling;
        setIsShuffling(nextShuffle);

        try {
            const queue = await TrackPlayer.getQueue();
            if (queue.length <= 1) return;

            if (nextShuffle) {
                originalQueueRef.current = queue;
                const currentId = currentTrack?.id;
                const current = queue.find(t => t.id === currentId) || queue[0];
                const rest = queue.filter(t => t.id !== current.id);
                for (let i = rest.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [rest[i], rest[j]] = [rest[j], rest[i]];
                }
                const newQueue = [current, ...rest];
                await TrackPlayer.reset();
                await TrackPlayer.add(newQueue);
                await TrackPlayer.skip(0);
                if (isPlaying) await TrackPlayer.play();
            } else if (originalQueueRef.current) {
                const originalQueue = originalQueueRef.current;
                const currentId = currentTrack?.id;
                await TrackPlayer.reset();
                await TrackPlayer.add(originalQueue);
                const index = currentId ? originalQueue.findIndex(t => t.id === currentId) : 0;
                if (index >= 0) await TrackPlayer.skip(index);
                if (isPlaying) await TrackPlayer.play();
                originalQueueRef.current = null;
            }
        } catch (e) {}
    };

    const handlePlayPause = () => {
        isPlaying ? pause() : resume();
    };

    const cycleRepeatMode = () => {
        setRepeatMode(prev => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
    };

    const handleShare = async () => {
        try {
            const title = currentTrack?.title || 'Track';
            const artist = currentTrack?.artist ? ` — ${currentTrack.artist}` : '';
            await Share.share({ message: `${title}${artist}` });
        } catch (e) {
            // ignore
        }
    };


    // Animated Styles
    const lyricsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: lyricsOpacity.value,
        zIndex: showLyrics ? 10 : -1,
    }));
    
    const artworkAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: artworkScale.value }],
        opacity: interpolate(lyricsOpacity.value, [0, 1], [1, 0], Extrapolation.CLAMP),
    }));

    const controlsGlassAnimatedStyle = useAnimatedStyle(() => ({
        opacity: showLyrics ? 0 : 0.12,
    }));

    const controlsSolidAnimatedStyle = useAnimatedStyle(() => ({
        opacity: showLyrics && controlsVisible ? 1 : 0,
    }));

    const headerGlassAnimatedStyle = useAnimatedStyle(() => ({
        opacity: showHeaderMeta ? 1 : 0.6,
    }));

    const playButtonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: playButtonScale.value }],
    }));

    const controlsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: controlsOpacity.value,
    }));

    const handleScroll = (event: any) => {
        const y = event.nativeEvent.contentOffset.y;
        const next = y > height * 0.3;
        setShowHeaderDetails(prev => (prev === next ? prev : next));
    };

    const toggleLyrics = () => {
        setShowLyrics(prev => {
            const next = !prev;
            if (next) {
                setControlsVisible(true);
            } else {
                setControlsVisible(true);
            }
            return next;
        });
    };

    const handleLyricsScrollStart = () => {
        if (showLyrics) {
            if (controlsVisible) {
                setControlsVisible(false);
            }
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <MusicBackground variant="player" style={styles.container}>
                <Image 
                    source={currentTrack.artwork ? { uri: currentTrack.artwork } : placeholderImage} 
                    style={styles.backgroundImage} 
                    blurRadius={80}
                />
                <View style={styles.backdrop} />
                
                {/* Main Content Area */}
                <View style={styles.mainContainer}>
                    <ScrollView
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 60 }]}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={!showLyrics}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        <View style={[styles.topSection, { height: topSectionHeight }]}>
                            {/* 1. Artwork Layer (Bottom) */}
                            <View style={styles.artworkLayer}>
                                <Animated.View style={artworkAnimatedStyle}>
                                    <Image 
                                        source={currentTrack.artwork ? { uri: currentTrack.artwork } : placeholderImage} 
                                        style={styles.artwork} 
                                    />
                                </Animated.View>
                                {!showLyrics && (
                                    <View style={styles.infoRow}>
                                        <View style={styles.infoText}>
                                            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                                                {currentTrack.title}
                                            </Text>
                                            <Text style={styles.artist} numberOfLines={1} ellipsizeMode="tail">
                                                {currentTrack.artist || 'Unknown Artist'}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setIsLiked(prev => !prev)} style={styles.likeButton}>
                                            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={22} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            {/* 3. Controls Layer (Top) */}
                            <Animated.View
                                style={[styles.controlsLayer, { paddingBottom: insets.bottom + 20 }, controlsAnimatedStyle]}
                                pointerEvents={showLyrics && !controlsVisible ? 'none' : 'auto'}
                            >
                                <Animated.View
                                    style={[styles.controlsSolidUnderlay, controlsSolidAnimatedStyle]}
                                    pointerEvents="none"
                                />
                        
                        {/* Glassy Overlay for Lyrics Mode - Masked for Gradient Blur */}
                        <Animated.View 
                            style={[
                                StyleSheet.absoluteFill, 
                                { top: -50 }, // Extend blur up
                                { zIndex: -1 },
                                controlsGlassAnimatedStyle
                            ]}
                        >
                            <MaskedView
                                style={StyleSheet.absoluteFill}
                                maskElement={
                                    <LinearGradient
                                        colors={['transparent', 'black', 'black']}
                                        locations={[0, 0.3, 1]}
                                        style={StyleSheet.absoluteFill}
                                    />
                                }
                            >
                                <View style={styles.controlsGlassTint} />
                            </MaskedView>
                        </Animated.View>

                        {/* Progress Bar */}
                        <View style={styles.progressSection}>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={duration}
                                value={position}
                                onSlidingComplete={(val) => {
                                    seekTo(val);
                                }}
                                minimumTrackTintColor="#FFFFFF"
                                maximumTrackTintColor="rgba(255,255,255,0.25)"
                                thumbTintColor="#FFFFFF"
                            />
                            <View style={styles.timeContainer}>
                                <Text style={styles.timeText}>{formatTime(position)}</Text>
                                <Text style={styles.timeText}>{formatTime(duration)}</Text>
                            </View>
                        </View>

                        {/* Playback Controls */}
                        <View style={styles.controlsRow}>
                            <TouchableOpacity onPress={toggleShuffle} style={styles.sideControl}>
                                <View style={styles.controlIconWrap}>
                                    <Ionicons
                                        name="shuffle"
                                        size={22}
                                        color={isShuffling ? "#1DB954" : "rgba(255,255,255,0.6)"}
                                    />
                                    {isShuffling && <View style={styles.controlActiveDot} />}
                                </View>
                            </TouchableOpacity>

                            <View style={styles.mainControls}>
                                <TouchableOpacity onPress={skipToPrevious} style={styles.controlIcon}>
                                    <Ionicons name="play-skip-back" size={32} color="#fff" />
                                </TouchableOpacity>
                                
                                <Animated.View style={playButtonAnimatedStyle}>
                                    <TouchableOpacity onPress={handlePlayPause} style={styles.playIcon}>
                                        <Ionicons name={isPlaying ? "pause" : "play"} size={48} color="#fff" />
                                    </TouchableOpacity>
                                </Animated.View>

                                <TouchableOpacity onPress={skipToNext} style={styles.controlIcon}>
                                    <Ionicons name="play-skip-forward" size={32} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity onPress={cycleRepeatMode} style={styles.sideControl}>
                                <View style={styles.controlIconWrap}>
                                    <Ionicons
                                        name={repeatMode === 'off' ? 'repeat-outline' : 'repeat'}
                                        size={22}
                                        color={repeatMode === 'off' ? "rgba(255,255,255,0.6)" : "#1DB954"}
                                    />
                                    {repeatMode !== 'off' && <View style={styles.controlActiveDot} />}
                                    {repeatMode === 'one' && (
                                        <View style={styles.repeatBadge}>
                                            <Text style={styles.repeatBadgeText}>1</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Bottom Action Row */}
                        <View style={styles.bottomRow}>
                            <TouchableOpacity onPress={toggleLyrics} style={styles.bottomLabel} activeOpacity={0.85}>
                                <Text style={[styles.bottomLabelText, showLyrics && styles.bottomLabelTextActive]}>
                                    Lyrics
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.outputButton} activeOpacity={0.85}>
                                <Ionicons name="volume-high" size={18} color="rgba(255,255,255,0.85)" />
                                <Text style={styles.outputText}>Output</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setShowQueue(true)} style={styles.bottomIcon}>
                                <Ionicons name="list" size={22} color="rgba(255,255,255,0.85)" />
                            </TouchableOpacity>
                        </View>
                            </Animated.View>
                        </View>

                        {!showLyrics && (
                            <View style={styles.tile}>
                            <View style={styles.tileHeader}>
                                <Text style={styles.tileTitle}>Credits</Text>
                                <Text style={styles.tileAction}>Show all</Text>
                            </View>
                            <View style={styles.creditItem}>
                                <View style={styles.creditText}>
                                    <Text style={styles.creditName}>{artistName}</Text>
                                    <Text style={styles.creditRole}>Main Artist</Text>
                                </View>
                                <View style={styles.followPill}>
                                    <Text style={styles.followText}>Following</Text>
                                </View>
                            </View>
                            <View style={styles.creditItem}>
                                <View style={styles.creditText}>
                                    <Text style={styles.creditName}>Samuel Adu Frimpong</Text>
                                    <Text style={styles.creditRole}>Composer</Text>
                                </View>
                            </View>
                            <View style={styles.creditItem}>
                                <View style={styles.creditText}>
                                    <Text style={styles.creditName}>Atown TSB</Text>
                                    <Text style={styles.creditRole}>Producer</Text>
                                </View>
                            </View>
                        </View>
                        )}

                        {!showLyrics && (
                        <View style={styles.aboutTile}>
                            <View style={styles.aboutImageWrap}>
                                <Image
                                    source={currentTrack.artwork ? { uri: currentTrack.artwork } : placeholderImage}
                                    style={styles.aboutImageLarge}
                                />
                                <View style={styles.aboutLabel}>
                                    <Text style={styles.aboutLabelText}>About the artist</Text>
                                </View>
                            </View>
                            <View style={styles.aboutFooter}>
                                <View style={styles.aboutMeta}>
                                    <View style={styles.aboutHeaderRow}>
                                        <Text style={styles.aboutName}>{artistName}</Text>
                                        <View style={styles.followPill}>
                                            <Text style={styles.followText}>Following</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.aboutListeners}>267.5K monthly listeners</Text>
                                    <Text style={styles.aboutSummary} numberOfLines={3}>
                                        {artistName} blends timeless melodies with a warm, modern worship sound that invites
                                        reflection and joy.
                                    </Text>
                                </View>
                            </View>
                        </View>
                        )}
                    </ScrollView>

                    {/* 2. Lyrics Overlay (Middle) */}
                    <Animated.View
                        style={[styles.lyricsLayer, lyricsAnimatedStyle]}
                        pointerEvents={showLyrics ? 'auto' : 'none'}
                    >
                        <View style={StyleSheet.absoluteFill}>
                            <LyricsView 
                                lyrics={currentTrack.lyrics} 
                                fullScreen
                                onSeek={(time) => {
                                    seekTo(time);
                                }}
                                onScrollStart={handleLyricsScrollStart}
                            />
                        </View>
                        {showLyrics && (
                            <TapGestureHandler onActivated={() => setControlsVisible(true)}>
                                <Animated.View
                                    style={[
                                        styles.lyricsTapShield,
                                        { height: height * 0.35 },
                                    ]}
                                    pointerEvents={controlsVisible ? 'none' : 'auto'}
                                />
                            </TapGestureHandler>
                        )}
                    </Animated.View>
                </View>

                {/* Header (Always on top) */}
                <View style={[styles.header, { paddingTop: insets.top }]}>
                    {/* Header Glass Background */}
                    <Animated.View 
                        style={[
                            StyleSheet.absoluteFill, 
                            { bottom: -30 }, // Extend blur down
                            headerGlassAnimatedStyle,
                            { zIndex: -1 }
                        ]}
                    >
                        <MaskedView
                            style={StyleSheet.absoluteFill}
                            maskElement={
                                <LinearGradient
                                    colors={['black', 'black', 'transparent']}
                                    locations={[0, 0.8, 1]}
                                    style={StyleSheet.absoluteFill}
                                />
                            }
                        >
                            <BlurView 
                                intensity={35} 
                                tint="dark" 
                                style={StyleSheet.absoluteFill} 
                            />
                        </MaskedView>
                    </Animated.View>

                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                        <Ionicons name="chevron-down" size={28} color="#fff" />
                    </TouchableOpacity>
                    
                    <View style={[styles.headerTitleContainer, showHeaderMeta ? styles.headerTitleLeft : styles.headerTitleCenter]}>
                        {showHeaderMeta ? (
                            <View style={styles.lyricsHeaderRow}>
                                <Image
                                    source={currentTrack.artwork ? { uri: currentTrack.artwork } : placeholderImage}
                                    style={styles.lyricsHeaderArt}
                                />
                                <View style={styles.lyricsHeaderText}>
                                    <Text style={styles.headerTitle} numberOfLines={1}>
                                        {currentTrack.title}
                                    </Text>
                                    <Text style={styles.headerSubtitle} numberOfLines={1}>
                                        {currentTrack.artist || 'Unknown Artist'}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <Text style={styles.headerTitle} numberOfLines={1}>
                                NOW PLAYING
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.headerIcon}>
                        <Ionicons name="ellipsis-horizontal" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* More Menu */}
                <Modal
                    visible={showMenu}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowMenu(false)}
                >
                    <Pressable style={styles.menuOverlay} onPress={() => setShowMenu(false)}>
                        <Pressable style={styles.menuSheet} onPress={() => {}}>
                            <View style={styles.menuHandle} />
                            <View style={styles.menuHeader}>
                                <Image
                                    source={currentTrack.artwork ? { uri: currentTrack.artwork } : placeholderImage}
                                    style={styles.menuArtwork}
                                />
                                <View style={styles.menuHeaderText}>
                                    <Text style={styles.menuTitle} numberOfLines={1}>
                                        {currentTrack.title}
                                    </Text>
                                    <Text style={styles.menuSubtitle} numberOfLines={1}>
                                        {currentTrack.artist || 'Unknown Artist'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.menuList}>
                                <TouchableOpacity style={styles.menuItem} onPress={() => { handleShare(); setShowMenu(false); }}>
                                    <Ionicons name="share-outline" size={22} color="#fff" />
                                    <Text style={styles.menuItemText}>Share</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleLyrics(); setShowMenu(false); }}>
                                    <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
                                    <Text style={styles.menuItemText}>Lyrics • {showLyrics ? 'On' : 'Off'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItem} onPress={() => { setShowAddToPlaylist(true); setShowMenu(false); }}>
                                    <Ionicons name="add-circle-outline" size={22} color="#fff" />
                                    <Text style={styles.menuItemText}>Add to playlist</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItem} onPress={() => { setShowQueue(true); setShowMenu(false); }}>
                                    <Ionicons name="list-outline" size={22} color="#fff" />
                                    <Text style={styles.menuItemText}>Go to Queue</Text>
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>

                {/* Modals */}
                <AddToPlaylistModal 
                    visible={showAddToPlaylist} 
                    onClose={() => setShowAddToPlaylist(false)} 
                    track={currentTrack} 
                />
                <QueueModal
                    visible={showQueue}
                    onClose={() => setShowQueue(false)}
                />
            </MusicBackground>
        </GestureHandlerRootView>
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
        backgroundColor: 'rgba(0,0,0,0.22)',
    },
    mainContainer: {
        flex: 1,
        position: 'relative',
    },
    scrollContent: {
        paddingBottom: 24,
    },
    topSection: {
        position: 'relative',
    },
    tile: {
        marginHorizontal: 24,
        marginBottom: 18,
        borderRadius: 24,
        padding: 18,
        overflow: 'hidden',
        backgroundColor: '#1b1b1b',
    },
    tileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    tileTitle: {
        fontSize: 18,
        fontFamily: MUSIC_FONTS.ui,
        color: '#fff',
    },
    tileAction: {
        fontSize: 14,
        fontFamily: MUSIC_FONTS.ui,
        color: '#1DB954',
    },
    creditItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    creditText: {
        flex: 1,
        paddingRight: 12,
    },
    creditName: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
        color: '#fff',
        marginBottom: 4,
    },
    creditRole: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.body,
        color: 'rgba(255,255,255,0.6)',
    },
    followPill: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    followText: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.ui,
        color: '#fff',
    },
    aboutTile: {
        marginHorizontal: 24,
        marginBottom: 32,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#1b1b1b',
    },
    aboutImageWrap: {
        position: 'relative',
    },
    aboutImageLarge: {
        width: '100%',
        height: 240,
    },
    aboutLabel: {
        position: 'absolute',
        top: 16,
        left: 16,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    aboutLabelText: {
        fontSize: 14,
        fontFamily: MUSIC_FONTS.ui,
        color: '#fff',
    },
    aboutFooter: {
        paddingHorizontal: 18,
        paddingVertical: 16,
    },
    aboutMeta: {
        flex: 1,
    },
    aboutHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    aboutName: {
        fontSize: 18,
        fontFamily: MUSIC_FONTS.ui,
        color: '#fff',
        marginBottom: 4,
    },
    aboutListeners: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.body,
        color: 'rgba(255,255,255,0.65)',
    },
    lyricsTapShield: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    aboutSummary: {
        marginTop: 8,
        fontSize: 13,
        fontFamily: MUSIC_FONTS.body,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 18,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100, // Includes safe area
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 10,
        zIndex: 50,
    },
    headerTitleContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    headerTitleLeft: {
        alignItems: 'flex-start',
    },
    headerTitleCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 13,
        fontFamily: MUSIC_FONTS.ui,
        color: '#fff',
        letterSpacing: 0.4,
        fontWeight: '600',
    },
    headerSubtitle: {
        fontSize: 11,
        fontFamily: MUSIC_FONTS.body,
        color: 'rgba(255,255,255,0.65)',
        marginTop: 2,
    },
    lyricsHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    lyricsHeaderArt: {
        width: 32,
        height: 32,
        borderRadius: 6,
    },
    lyricsHeaderText: {
        flex: 1,
        minWidth: 0,
    },
    headerIcon: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    artworkLayer: {
        position: 'absolute',
        top: HEADER_HEIGHT + 32,
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
        marginTop: 18,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        width: '100%',
    },
    infoText: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 22,
        fontFamily: MUSIC_FONTS.ui,
        color: '#fff',
        fontWeight: '700',
        marginBottom: 8,
    },
    artist: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.body,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 8,
    },
    likeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    lyricsLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 100, // Make room for header
        paddingBottom: CONTROLS_HEIGHT, // Make room for controls
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        zIndex: 10,
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: CONTROLS_HEIGHT + 40,
        zIndex: 10,
    },
    controlsLayer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        paddingHorizontal: 24,
        backgroundColor: 'transparent', // Ensure it doesn't block background
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
        color: 'rgba(255,255,255,0.5)',
        fontVariant: ['tabular-nums'],
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    mainControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 40,
    },
    sideControl: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlIconWrap: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlActiveDot: {
        position: 'absolute',
        bottom: -6,
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#1DB954',
    },
    repeatBadge: {
        position: 'absolute',
        right: -8,
        top: -8,
        width: 14,
        height: 14,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1DB954',
    },
    repeatBadgeText: {
        fontSize: 9,
        fontFamily: MUSIC_FONTS.ui,
        color: '#0B0C0E',
        lineHeight: 10,
    },
    controlsGlassTint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(20,20,24,0.12)',
    },
    controlsSolidUnderlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
    },
    controlIcon: {
        padding: 10,
    },
    playIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
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
        letterSpacing: 0.2,
    },
    bottomActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    bottomIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    bottomLabel: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 64,
    },
    bottomLabelText: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.ui,
        color: 'rgba(255,255,255,0.85)',
        letterSpacing: 0.2,
    },
    bottomLabelTextActive: {
        color: '#fff',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    menuSheet: {
        backgroundColor: '#1b1b1b',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 32,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
    },
    menuHandle: {
        alignSelf: 'center',
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginBottom: 12,
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    menuArtwork: {
        width: 48,
        height: 48,
        borderRadius: 8,
    },
    menuHeaderText: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
        color: '#fff',
    },
    menuSubtitle: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.body,
        color: 'rgba(255,255,255,0.65)',
        marginTop: 4,
    },
    menuList: {
        gap: 6,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 14,
    },
    menuItemText: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
        color: '#fff',
    },
});
