import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
    Extrapolation,
    runOnJS,
} from 'react-native-reanimated';
import { useProgress } from 'react-native-track-player';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../context/SettingsContext';
import { MUSIC_FONTS } from '../constants/musicTheme';
import { parseLRC, LyricLine } from '../utils/lrcParser';

interface Props {
    lyrics: string | LyricLine[];
    onSeek?: (time: number) => void;
    fullScreen?: boolean;
    onScrollStart?: () => void;
}

// Individual lyric line component with animations
const AnimatedLyricLine = React.memo(({ 
    item, 
    index, 
    isActive, 
    isPassed,
    onPress,
    isDark,
}: {
    item: LyricLine;
    index: number;
    isActive: boolean;
    isPassed: boolean;
    onPress: () => void;
    isDark: boolean;
}) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.35);

    useEffect(() => {
        if (isActive) {
            scale.value = withSpring(1.05, { 
                damping: 15, 
                stiffness: 150,
                mass: 0.8,
            });
            opacity.value = withTiming(1, { duration: 250 });
        } else if (isPassed) {
            scale.value = withSpring(1, { damping: 20, stiffness: 200 });
            opacity.value = withTiming(0.25, { duration: 300 });
        } else {
            scale.value = withSpring(1, { damping: 20, stiffness: 200 });
            opacity.value = withTiming(0.4, { duration: 300 });
        }
    }, [isActive, isPassed]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    // Empty line (instrumental break)
    if (!item.text.trim()) {
        return <View style={styles.instrumentalLine} />;
    }

    return (
        <TouchableOpacity 
            onPress={handlePress}
            activeOpacity={0.7}
            style={styles.lineContainer}
        >
            <Animated.Text 
                style={[
                    styles.lyricText,
                    animatedStyle,
                    isActive && styles.lyricTextActive,
                    isActive && {
                        textShadowColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)',
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 12,
                    },
                ]}
            >
                {item.text}
            </Animated.Text>
        </TouchableOpacity>
    );
});

export const LyricsView = ({ lyrics, onSeek, fullScreen = false, onScrollStart }: Props) => {
    const { position } = useProgress(200); // Update every 200ms for smoother tracking
    const { theme } = useSettings();
    const { height } = Dimensions.get('window');
    const flatListRef = useRef<FlatList>(null);
    const currentIndexRef = useRef(-1);
    const isDark = theme.mode === 'dark';

    // Parse lyrics - handles both LRC string and pre-parsed array
    const parsedLyrics = useMemo((): LyricLine[] => {
        if (!lyrics) return [];

        if (typeof lyrics === 'string') {
            // Check if it's LRC format (starts with [)
            if (lyrics.trim().startsWith('[')) {
                const parsed = parseLRC(lyrics);
                return parsed.lyrics;
            }
            // Try JSON parse
            try {
                return JSON.parse(lyrics);
            } catch {
                // Fallback: split by newlines (non-timed lyrics)
                return lyrics.split('\n')
                    .filter(line => line.trim())
                    .map((line, idx) => ({ time: idx * 5, text: line }));
            }
        }
        return lyrics;
    }, [lyrics]);

    // Find current active line based on playback position
    const currentIndex = useMemo(() => {
        if (parsedLyrics.length === 0) return -1;
        
        for (let i = parsedLyrics.length - 1; i >= 0; i--) {
            if (position >= parsedLyrics[i].time) {
                return i;
            }
        }
        return -1;
    }, [position, parsedLyrics]);

    // Track user scroll interaction
    const isUserScrollingRef = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Item height constant for calculations
    const ITEM_HEIGHT = 72;

    // Auto-scroll to current line
    useEffect(() => {
        if (currentIndex < 0 || parsedLyrics.length === 0) return;
        if (isUserScrollingRef.current) return; // Don't auto-scroll if user is scrolling

        flatListRef.current?.scrollToIndex({
            index: currentIndex,
            animated: true,
            viewPosition: 0.5,
        });
    }, [currentIndex, parsedLyrics.length]);

    // Handle scroll events to detect user interaction
    const handleScrollBeginDrag = useCallback(() => {
        isUserScrollingRef.current = true;
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        if (onScrollStart) {
            onScrollStart();
        }
    }, [onScrollStart]);

    const handleScrollEndDrag = useCallback(() => {
        // Reset after 3 seconds to resume auto-scrolling
        scrollTimeoutRef.current = setTimeout(() => {
            isUserScrollingRef.current = false;
        }, 3000);
    }, []);

    // Handle seek when user taps a line
    const handleSeek = useCallback((time: number) => {
        isUserScrollingRef.current = false; // Resume auto-scroll after seeking
        if (onSeek) {
            onSeek(time);
        }
    }, [onSeek]);

    // Calculate dynamic padding for centering active line
    // Use equal padding to keep active line truly centered
    const centerPadding = Math.round(height * 0.46);

    const renderItem = useCallback(({ item, index }: { item: LyricLine; index: number }) => (
        <AnimatedLyricLine
            item={item}
            index={index}
            isActive={index === currentIndex}
            isPassed={index < currentIndex}
            onPress={() => handleSeek(item.time)}
            isDark={isDark}
        />
    ), [currentIndex, handleSeek, isDark]);

    const keyExtractor = useCallback((_: LyricLine, index: number) => index.toString(), []);

    const handleScrollToIndexFailed = useCallback((info: any) => {
        const wait = new Promise(resolve => setTimeout(resolve, 500));
        wait.then(() => {
            flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0.5,
            });
        });
    }, []);

    if (parsedLyrics.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>
                    No lyrics available
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={parsedLyrics}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingTop: centerPadding, paddingBottom: centerPadding },
                ]}
                showsVerticalScrollIndicator={false}
                onScrollBeginDrag={handleScrollBeginDrag}
                onScrollEndDrag={handleScrollEndDrag}
                onScrollToIndexFailed={handleScrollToIndexFailed}
                removeClippedSubviews={true}
                maxToRenderPerBatch={15}
                windowSize={11}
                initialNumToRender={20}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.body,
    },
    listContent: {
        paddingHorizontal: 24,
    },
    lineContainer: {
        minHeight: 64,
        justifyContent: 'center',
        paddingVertical: 8,
    },
    instrumentalLine: {
        height: 40,
    },
    lyricText: {
        fontSize: 26,
        lineHeight: 36,
        fontFamily: MUSIC_FONTS.ui,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    lyricTextActive: {
        fontSize: 30,
        lineHeight: 42,
        fontWeight: '700',
    },
});
