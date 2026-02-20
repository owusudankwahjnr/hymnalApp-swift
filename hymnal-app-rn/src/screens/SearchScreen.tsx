import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getHymnMatchType } from '../utils/hymnUtils';

// ... (inside SearchScreenComponent)


import { View, FlatList, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import { HymnService } from '../services/HymnService';
import { HymnRow } from '../components/HymnRow';
import { SearchBar } from '../components/SearchBar';
import { FloatingSearchButton } from '../components/FloatingSearchButton';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import HymnBook from '../db/models/HymnBook';
import { AdBannerWrapper } from '../components/AdBannerWrapper';
import { NativeAdRow } from '../components/NativeAdRow';
import { ENABLE_ADS } from '../constants/Ads';
import { MusicBackground } from '../components/MusicBackground';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';

const LIMIT = 20;
const AD_FREQUENCY = 10; // Show ad every 10 hymns

const injectAds = (items: any[], startIndex: number) => {
    if (!ENABLE_ADS) return items;

    const withAds = [];
    for (let i = 0; i < items.length; i++) {
        withAds.push(items[i]);
        // Inject ad if (globalIndex + 1) is divisible by AD_FREQUENCY
        if ((startIndex + i + 1) % AD_FREQUENCY === 0) {
            withAds.push({ type: 'ad', id: `ad-${startIndex + i}` });
        }
    }
    return withAds;
};


const CategoryPill = ({ title, isSelected, onPress }: { title: string, isSelected: boolean, onPress: () => void }) => {
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);
    return (
        <TouchableOpacity
            style={[
                styles.pill,
                isSelected
                    ? { backgroundColor: palette.surfaceMuted, borderColor: palette.textMuted }
                    : { backgroundColor: palette.surface, borderColor: palette.border }
            ]}
            onPress={onPress}
        >
            <Text style={[
                styles.pillText,
                isSelected ? { color: palette.text } : { color: palette.text }
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const SearchScreenComponent = ({ hymnBooks }: { hymnBooks: HymnBook[] }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]); // Using any[] to avoid strict type checking issues with WatermelonDB models in state for now, or import Hymn
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
    const searchInputRef = useRef<any>(null);
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);

    const navigation = useNavigation<any>();

    const [isDeepSearch, setIsDeepSearch] = useState(false);

    const search = useCallback(async (reset = false) => {
        if (reset) {
            setLoading(true);
            setPage(0);
            setHasMore(true);
            setIsDeepSearch(false);
        } else {
            setLoadingMore(true);
        }

        try {
            const skip = reset ? 0 : page * LIMIT;

            // First try standard search
            let allMatches = await HymnService.searchHymns(query, selectedBookId || undefined).fetch();
            let deepSearchActive = false;

            // If no results and query is present, try deep search
            if (allMatches.length === 0 && query.trim().length > 0 && reset) {
                allMatches = await HymnService.searchHymnsDeep(query, selectedBookId || undefined).fetch();
                if (allMatches.length > 0) {
                    deepSearchActive = true;
                    setIsDeepSearch(true);
                }
            } else if (!reset && isDeepSearch) {
                // Continue deep search for pagination
                allMatches = await HymnService.searchHymnsDeep(query, selectedBookId || undefined).fetch();
                deepSearchActive = true;
            }

            const sliced = allMatches.slice(skip, skip + LIMIT);
            const data = sliced;

            // Calculate starting index for this page (or 0 if reset)
            const currentCount = reset ? 0 : results.filter(r => r.type !== 'ad').length;
            
            // Inject ads into the data
            const dataWithAds = injectAds(data, currentCount);

            if (reset) {
                setResults(dataWithAds);
            } else {
                setResults(prev => [...prev, ...dataWithAds]);
            }

            if (data.length < LIMIT) {
                setHasMore(false);
            }

            if (!reset) {
                setPage(prev => prev + 1);
            } else {
                setPage(1);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [query, selectedBookId, page, isDeepSearch]);

    useEffect(() => {
        const delay = query === '' ? 0 : 500;
        const timeout = setTimeout(() => search(true), delay);
        return () => clearTimeout(timeout);
    }, [query, selectedBookId]);

    // Auto-focus search input when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            const timer = setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }, [])
    );

    const [showFloatingSearch, setShowFloatingSearch] = useState(false);

    const handleLoadMore = () => {
        if (!loading && !loadingMore && hasMore) {
            search(false);
        }
    };

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowFloatingSearch(offsetY > 100);
    };

    const handleFloatingSearchPress = () => {
        searchInputRef.current?.focus();
    };

    const renderSkeleton = () => (
        <View style={styles.skeletonContainer}>
            {[...Array(6)].map((_, i) => (
                <View key={i} style={styles.skeletonRow}>
                    <SkeletonLoader width={40} height={40} borderRadius={20} style={{ marginRight: 16 }} />
                    <View style={{ flex: 1 }}>
                        <SkeletonLoader width="60%" height={16} style={{ marginBottom: 8 }} />
                        <SkeletonLoader width="40%" height={12} />
                    </View>
                </View>
            ))}
        </View>
    );

    return (
        <MusicBackground>
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: palette.text }]}>Search</Text>
                <Text style={[styles.subtitle, { color: palette.textMuted }]}>Find hymns by title, number, or lyrics</Text>
            </View>

            <View style={styles.stickyHeader}>
                <View style={styles.searchContainer}>
                    <SearchBar
                        ref={searchInputRef}
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search hymns..."
                    />
                </View>

                <View style={styles.categoryContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                        <CategoryPill
                            title="All Hymn Books"
                            isSelected={selectedBookId === null}
                            onPress={() => setSelectedBookId(null)}
                        />
                        {[...hymnBooks]
                            .sort((a: any, b: any) => {
                                if (a.isPinned === b.isPinned) return a.title.localeCompare(b.title);
                                return a.isPinned ? -1 : 1;
                            })
                            .map(book => (
                                <CategoryPill
                                    key={book.id}
                                    title={book.title}
                                    isSelected={selectedBookId === book.id}
                                    onPress={() => setSelectedBookId(book.id)}
                                />
                            ))}
                    </ScrollView>
                </View>
            </View>

            {loading ? (
                renderSkeleton()
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    renderItem={({ item }) => {
                        // Render native ad if item is an ad
                        if (item.type === 'ad') {
                            return <NativeAdRow />;
                        }

                        let matchType: 'verse' | 'chorus' | undefined;
                        if (isDeepSearch) {
                            matchType = getHymnMatchType(item, query);
                        }

                        return (
                            <HymnRow
                                hymn={item}
                                onPress={() => navigation.navigate('HymnDetail', { hymnId: item.id })}
                                matchType={matchType}
                            />
                        );
                    }}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? (
                            <View style={styles.footerLoader}>
                                <SkeletonLoader width="100%" height={60} />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={[styles.emptyText, { color: palette.textMuted }]}>No results found</Text>
                        </View>
                    }
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    contentContainerStyle={styles.list}
                />
            )}
            {/* Floating Search Button */}
            <FloatingSearchButton
                visible={showFloatingSearch}
                onPress={handleFloatingSearchPress}
            />

            <AdBannerWrapper />
        </View>
        </MusicBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.m,
        paddingBottom: SPACING.s,
    },
    title: {
        fontSize: 34,
        fontFamily: MUSIC_FONTS.display,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: MUSIC_FONTS.body,
        marginTop: 6,
    },
    stickyHeader: {
        zIndex: 1,
        paddingBottom: SPACING.s,
    },
    searchContainer: {
        paddingHorizontal: SPACING.m,
        marginBottom: SPACING.s,
    },
    categoryContainer: {
        height: 40,
    },
    categoryScroll: {
        paddingHorizontal: SPACING.m,
        gap: 8,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 18,
        borderWidth: 1,
    },
    pillText: {
        fontSize: 14,
        fontFamily: MUSIC_FONTS.ui,
    },
    list: {
        paddingBottom: 100,
    },
    skeletonContainer: {
        padding: SPACING.m,
    },
    skeletonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    footerLoader: {
        padding: SPACING.m,
    },
    empty: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.body,
    },
});

export const SearchScreen = withObservables([], () => ({
    hymnBooks: HymnService.getHymnBooks(),
}))(SearchScreenComponent);
