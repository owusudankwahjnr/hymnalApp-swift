import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { useSettings } from '../context/SettingsContext';
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from 'react-native-track-player';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';

const placeholderImage = require('../../assets/images/music-placeholder.png');

type MiniPlayerVariant = 'floating' | 'docked';

export const MiniPlayer = ({ variant = 'floating' }: { variant?: MiniPlayerVariant }) => {
    const navigation = useNavigation<any>();
    const { currentTrack, isPlaying, pause, resume } = usePlayer();
    const { theme } = useSettings();
    const { position, duration } = useProgress();
    const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
    const insets = useSafeAreaInsets();
    const palette = getMusicPalette(theme.mode);

    if (!currentTrack) return null;

    const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

    const bottomOffset = variant === 'docked'
        ? 0
        : (tabBarHeight > 0 ? Math.max(tabBarHeight - 1, 0) : Math.max(insets.bottom + 6, 12));

    return (
        <TouchableOpacity 
            style={[
                styles.container,
                variant === 'docked' && styles.containerDocked,
                { bottom: bottomOffset },
            ]} 
            onPress={() => navigation.navigate(currentTrack?.mediaType === 'podcast' ? 'PodcastPlayer' : 'Player')}
            activeOpacity={0.9}
        >
            <Image
                source={currentTrack.artwork ? { uri: currentTrack.artwork } : placeholderImage}
                style={styles.backdropImage}
                blurRadius={22}
            />
            <View
                style={[
                    styles.backdropTint,
                    { backgroundColor: theme.mode === 'dark' ? 'rgba(8,8,8,0.35)' : 'rgba(255,255,255,0.55)' },
                ]}
            />
            <View style={styles.content}>
                <View style={styles.artworkWrapper}>
                    <Image 
                        source={currentTrack.artwork ? { uri: currentTrack.artwork } : placeholderImage} 
                        style={styles.artwork} 
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.25)']}
                        style={StyleSheet.absoluteFill}
                    />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>
                        {currentTrack.title}
                    </Text>
                    <Text style={[styles.artist, { color: palette.textMuted }]} numberOfLines={1}>
                        {currentTrack.artist}
                    </Text>
                </View>
                <TouchableOpacity onPress={isPlaying ? pause : resume} style={[styles.controlButton, { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
                    <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: palette.divider }]}>
                <LinearGradient
                    colors={[palette.accent, palette.accentSecondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 64,
        marginHorizontal: 0,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: 'hidden',
        zIndex: 100,
        shadowOpacity: 0,
        elevation: 0,
    },
    containerDocked: {
        position: 'relative',
    },
    backdropImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    backdropTint: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 6,
    },
    artworkWrapper: {
        width: 46,
        height: 46,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#1F1F1F',
    },
    artwork: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    title: {
        fontSize: 15,
        fontFamily: MUSIC_FONTS.ui,
        letterSpacing: 0.2,
    },
    artist: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.body,
        letterSpacing: 0.2,
    },
    controlButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressTrack: {
        height: 2,
        width: '100%',
    },
    progressFill: {
        height: '100%',
    },
});
