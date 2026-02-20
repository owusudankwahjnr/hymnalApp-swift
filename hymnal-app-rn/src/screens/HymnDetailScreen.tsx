import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Modal, Text, FlatList, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useSharedValue, useAnimatedStyle, withSpring, withSequence, withDelay, withTiming, FadeIn, FadeOut } from 'react-native-reanimated';
import * as ScreenCapture from 'expo-screen-capture';
import * as Haptics from 'expo-haptics';
import withObservables from '@nozbe/with-observables';
import { of as of$, combineLatest } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { HymnService } from '../services/HymnService';
import Hymn from '../db/models/Hymn';
import HymnBook from '../db/models/HymnBook';
import { HymnContent } from '../components/HymnContent';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { useFavorites } from '../context/FavoritesContext';
import { SPACING } from '../constants/theme';
import { VariantRow } from '../components/VariantRow';
import { VariantStickyFooter } from '../components/VariantStickyFooter';
import { ReportModal } from '../components/ReportModal';
import { ShareModal } from '../components/ShareModal';
import { useSettings } from '../context/SettingsContext';
import { MusicBackground } from '../components/MusicBackground';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';

interface Props {
    hymn: Hymn;
    hymnBook: HymnBook;
    variants: Hymn[];
    hymnBooks: HymnBook[];
}

const HymnDetailScreenComponent: React.FC<Props> = ({ hymn, hymnBook, variants, hymnBooks }) => {
    const navigation = useNavigation<any>();
    const [showVariants, setShowVariants] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);
    const [fontSize, setFontSize] = useState(20);
    const baseFontSize = useRef(20);

    // Animation values
    const heartScale = useSharedValue(0);

    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const isFav = isFavorite(hymn.id);

    const onDoubleTap = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (!isFav) addFavorite(hymn.id);
        heartScale.value = withSequence(
            withSpring(1, { mass: 0.5, damping: 10, stiffness: 100 }),
            withDelay(200, withTiming(0, { duration: 300 }))
        );
    };

    const pinch = Gesture.Pinch()
        .onStart(() => { baseFontSize.current = fontSize; })
        .onUpdate((e) => {
            const newSize = Math.max(14, Math.min(40, baseFontSize.current * e.scale));
            runOnJS(setFontSize)(newSize);
        });

    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .runOnJS(true)
        .onEnd(() => { onDoubleTap(); });

    const backSwipe = Gesture.Pan()
        .activateAfterLongPress(2000)
        .activeOffsetX(10)
        .onEnd((e) => {
            if (e.translationX > 100 && e.velocityX > 0 && !navigation.canGoBack()) {
                runOnJS(navigation.reset)({ index: 0, routes: [{ name: 'Main' }] });
            }
        });

    const gestures = Gesture.Simultaneous(pinch, doubleTap, backSwipe);

    const heartStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: heartScale.value }],
            opacity: heartScale.value,
        };
    });

    useEffect(() => {
        const subscription = ScreenCapture.addScreenshotListener(() => {
            setShowShare(true);
        });
        return () => subscription.remove();
    }, []);

    React.useLayoutEffect(() => {
        if (hymn && hymnBook) {
            const canGoBack = navigation.canGoBack();
            navigation.setOptions({
                headerTitle: () => (
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text, textAlign: 'center' }} numberOfLines={1}>
                            {hymn.title}
                        </Text>
                        <Text style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center' }} numberOfLines={1}>
                            Hymn #{hymn.number} • {hymnBook.title}
                        </Text>
                    </View>
                ),
                headerTitleAlign: 'center',
                headerLeft: () => !canGoBack ? (
                    <TouchableOpacity 
                        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
                        style={{ flexDirection: 'row', alignItems: 'center', marginLeft: Platform.OS === 'ios' ? -8 : 0 }}
                    >
                        <Ionicons 
                            name={Platform.OS === 'ios' ? "chevron-back" : "arrow-back"} 
                            size={Platform.OS === 'ios' ? 32 : 24} 
                            color={theme.text} 
                        />
                        {Platform.OS === 'ios' && <Text style={{ color: theme.text, fontSize: 17, marginLeft: -4 }}>Back</Text>}
                    </TouchableOpacity>
                ) : undefined,
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.text,
                headerShadowVisible: true,
            });
        }
    }, [navigation, hymn, hymnBook, theme]);

    const toggleFavorite = () => {
        if (isFav) removeFavorite(hymn.id);
        else addFavorite(hymn.id);
    };

    if (!hymn) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={{ padding: SPACING.l, alignItems: 'center' }}>
                    <SkeletonLoader width="60%" height={32} style={{ marginBottom: 16 }} />
                    <SkeletonLoader width="30%" height={20} style={{ marginBottom: 32 }} />
                </View>
            </View>
        );
    }

    return (
        <MusicBackground variant="player" style={styles.container}>
            <GestureDetector gesture={gestures}>
                <View style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <HymnContent hymn={hymn as any} fontSize={fontSize} />
                    </ScrollView>
                    
                    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', zIndex: 100 }]}>
                        <Animated.View style={[{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }, heartStyle]}>
                            <Ionicons name="heart" size={100} color={theme.error} />
                        </Animated.View>
                    </View>
                </View>
            </GestureDetector>

            {variants && variants.length > 0 && (
                <VariantStickyFooter variants={variants} currentHymn={hymn} onPress={() => setShowVariants(true)} />
            )}

            <View style={styles.floatingActions}>
                <TouchableOpacity style={styles.actionButton} onPress={toggleFavorite}>
                    <View style={[styles.iconContainer, { backgroundColor: palette.glassStrong, borderColor: palette.border }]}>
                        <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? '#E55B5B' : palette.text} />
                    </View>
                    <Text style={[styles.actionLabel, { color: palette.textMuted }]}>Like</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => setShowShare(true)}>
                    <View style={[styles.iconContainer, { backgroundColor: palette.glassStrong, borderColor: palette.border }]}>
                        <Ionicons name="share-outline" size={22} color={palette.text} />
                    </View>
                    <Text style={[styles.actionLabel, { color: palette.textMuted }]}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => setShowReport(true)}>
                    <View style={[styles.iconContainer, { backgroundColor: palette.glassStrong, borderColor: palette.border }]}>
                        <Ionicons name="flag-outline" size={22} color={palette.text} />
                    </View>
                    <Text style={[styles.actionLabel, { color: palette.textMuted }]}>Report</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={showVariants} animationType="slide" transparent={true} onRequestClose={() => setShowVariants(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowVariants(false)}>
                    <View style={[styles.bottomSheet, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: palette.divider }]}>
                            <View style={[styles.dragHandle, { backgroundColor: palette.divider }]} />
                            <Text style={[styles.modalTitle, { color: palette.text }]}>Select Version</Text>
                            <Text style={[styles.modalSubtitle, { color: palette.textMuted }]}>Choose a variant of this hymn</Text>
                        </View>

                        {(() => {
                            const titleCounts = variants.reduce((acc, v) => {
                                const t = v.title.trim().toLowerCase();
                                acc[t] = (acc[t] || 0) + 1;
                                return acc;
                            }, {} as Record<string, number>);

                            const currentTitle = hymn.title.trim().toLowerCase();
                            const currentCount = titleCounts[currentTitle] || 0;
                            const bookMap = new Map((hymnBooks || []).map(b => [b.id, b]));

                            return (
                                <FlatList
                                    data={variants}
                                    keyExtractor={(item) => item.id}
                                    contentContainerStyle={styles.variantList}
                                    renderItem={({ item }) => {
                                        const isCurrent = item.id === hymn.id;
                                        const itemTitle = item.title.trim().toLowerCase();
                                        const itemCount = titleCounts[itemTitle] || 0;
                                        const isPinned = bookMap.get(item.hymnBookId)?.isPinned || false;
                                        
                                        const showBadge = !isPinned && itemTitle !== currentTitle && itemCount < currentCount;

                                        return (
                                            <VariantRow
                                                hymn={item}
                                                isCurrent={isCurrent}
                                                showBadge={showBadge}
                                                onPress={() => {
                                                    if (!isCurrent) {
                                                        setShowVariants(false);
                                                        navigation.replace('HymnDetail', { hymnId: item.id });
                                                    }
                                                }}
                                            />
                                        );
                                    }}
                                />
                            );
                        })()}
                    </View>
                </TouchableOpacity>
            </Modal>

            <ReportModal visible={showReport} onClose={() => setShowReport(false)} hymn={hymn} hymnBook={hymnBook} />
            <ShareModal visible={showShare} onClose={() => setShowShare(false)} hymn={hymn} hymnBook={hymnBook} />
        </MusicBackground>
    );
};

const enhance = withObservables(['route'], ({ route }: any) => ({
    hymn: HymnService.getHymn(route.params.hymnId),
    hymnBook: HymnService.getHymn(route.params.hymnId).pipe(
        switchMap(hymn => hymn ? hymn.hymnBook.observe() : of$(null))
    ) as any,
    hymnBooks: HymnService.getHymnBooks().observe(),
    variants: HymnService.getHymn(route.params.hymnId).pipe(
        switchMap((hymn: Hymn | null) => {
            if (!hymn || !hymn.variantKey) return of$([] as Hymn[]);
            
            return combineLatest([
                HymnService.getVariants(hymn.variantKey).observeWithColumns(['title', 'number']),
                HymnService.getHymnBooks().observe()
            ]).pipe(
                map(([hymns, books]) => {
                    const bMap = new Map(books.map(b => [b.id, b]));
                    
                    // Pre-calculate target title for diff checks
                    const currentTitle = hymn.title.trim().toLowerCase();
                    const titleCounts = hymns.reduce((acc, v) => {
                        const t = v.title.trim().toLowerCase();
                        acc[t] = (acc[t] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>);
                    const currentTitleCount = titleCounts[currentTitle] || 0;

                    return [...hymns].sort((a, b) => {
                        // 1. Current hymn always first
                        if (a.id === hymn.id) return -1;
                        if (b.id === hymn.id) return 1;
                        
                        // 2. Pinned hymnbooks next
                        const aPinned = bMap.get(a.hymnBookId)?.isPinned || false;
                        const bPinned = bMap.get(b.hymnBookId)?.isPinned || false;
                        
                        if (aPinned && !bPinned) return -1;
                        if (!aPinned && bPinned) return 1;

                        // 3. "Diff" variants next (title different AND minority title)
                        const aTitle = a.title.trim().toLowerCase();
                        const bTitle = b.title.trim().toLowerCase();
                        const aDiff = aTitle !== currentTitle && (titleCounts[aTitle] || 0) < currentTitleCount;
                        const bDiff = bTitle !== currentTitle && (titleCounts[bTitle] || 0) < currentTitleCount;

                        if (aDiff && !bDiff) return -1;
                        if (!aDiff && bDiff) return 1;
                        
                        // 4. Finally sort by title
                        return a.title.localeCompare(b.title) || a.number - b.number;
                    }) as Hymn[];
                })
            );
        })
    ),
}));

export const HymnDetailScreen = enhance(HymnDetailScreenComponent);

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 100 },
    floatingActions: { position: 'absolute', right: SPACING.m, bottom: 120, alignItems: 'center', gap: SPACING.m },
    actionButton: { alignItems: 'center', justifyContent: 'center' },
    iconContainer: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 5, marginBottom: 6 },
    actionLabel: { fontSize: 10, fontFamily: MUSIC_FONTS.ui, letterSpacing: 0.6, textTransform: 'uppercase' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.45)', justifyContent: 'flex-end' },
    bottomSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingBottom: SPACING.xl, borderWidth: 1 },
    modalHeader: { alignItems: 'center', padding: SPACING.m, borderBottomWidth: 1 },
    dragHandle: { width: 40, height: 4, borderRadius: 2, marginBottom: SPACING.m },
    modalTitle: { fontSize: 18, fontFamily: MUSIC_FONTS.headline, marginBottom: 4 },
    modalSubtitle: { fontSize: 14, fontFamily: MUSIC_FONTS.body },
    variantList: { padding: SPACING.m },
});
