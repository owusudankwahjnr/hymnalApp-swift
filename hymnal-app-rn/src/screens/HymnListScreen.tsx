import { getHymnMatchType } from '../utils/hymnUtils';

// ... (inside HymnListScreen)

import { View, FlatList, StyleSheet, Text } from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HymnService } from '../services/HymnService';
import { HymnRow } from '../components/HymnRow';
import { SearchBar } from '../components/SearchBar';
import { FloatingSearchButton } from '../components/FloatingSearchButton';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import { AdBannerWrapper } from '../components/AdBannerWrapper';
import { NativeAdRow } from '../components/NativeAdRow';

const LIMIT = 20;
const AD_FREQUENCY = 10; // Show ad every 10 hymns for visibility in demo

const injectAds = (items: any[], startIndex: number) => {
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

export const HymnListScreen = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]); // Using any[] for now to avoid strict type checking issues
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const searchInputRef = useRef<any>(null);
    const { theme } = useSettings();

    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { hymnBookId, hymnBookTitle } = route.params || {};

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
            let allMatches = await HymnService.searchHymns(query, hymnBookId).fetch();
            let deepSearchActive = false;

            // If no results and query is present, try deep search
            if (allMatches.length === 0 && query.trim().length > 0 && reset) {
                allMatches = await HymnService.searchHymnsDeep(query, hymnBookId).fetch();
                if (allMatches.length > 0) {
                    deepSearchActive = true;
                    setIsDeepSearch(true);
                }
            } else if (!reset && isDeepSearch) {
                // Continue deep search for pagination
                allMatches = await HymnService.searchHymnsDeep(query, hymnBookId).fetch();
                deepSearchActive = true;
            }

            const sliced = allMatches.slice(skip, skip + LIMIT);

            // Calculate starting index for this page (or 0 if reset)
            const currentCount = reset ? 0 : results.length;
            // Note: If we just append ads to the slice, we might mess up if we assume 'currentCount' tracks hymns only.
            // But for simple "every N items in the list", using the list length is roughly fine.
            // Ideally we track 'hymnCount'.

            const dataWithAds = injectAds(sliced, currentCount);

            if (reset) {
                setResults(dataWithAds);
            } else {
                setResults(prev => [...prev, ...dataWithAds]);
            }

            if (sliced.length < LIMIT) {
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
    }, [query, hymnBookId, page, isDeepSearch]);

    useEffect(() => {
        const delay = query === '' ? 0 : 500;
        const timeout = setTimeout(() => search(true), delay);
        return () => clearTimeout(timeout);
    }, [query, hymnBookId]);

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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
                <SearchBar
                    ref={searchInputRef}
                    value={query}
                    onChangeText={setQuery}
                    placeholder={`Search ${hymnBookTitle || 'hymns'}...`}
                />
            </View>

            {loading ? (
                renderSkeleton()
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        if (item.type === 'ad') {
                            return <NativeAdRow />;
                        }
                        return (
                            <HymnRow
                                hymn={item}
                                onPress={() => navigation.navigate('HymnDetail', { hymnId: item.id })}
                                matchType={isDeepSearch ? getHymnMatchType(item, query) : undefined}
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
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No hymns found</Text>
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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: SPACING.m,
        paddingBottom: SPACING.s,
        paddingTop: SPACING.m,
        zIndex: 1,
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
    },
});
