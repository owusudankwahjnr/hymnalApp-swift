import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const LIMIT = 20;

const CategoryPill = ({ title, isSelected, onPress }: { title: string, isSelected: boolean, onPress: () => void }) => {
    const { theme } = useSettings();
    return (
        <TouchableOpacity
            style={[
                styles.pill,
                isSelected
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: 'transparent', borderColor: theme.border }
            ]}
            onPress={onPress}
        >
            <Text style={[
                styles.pillText,
                isSelected ? { color: '#FFFFFF' } : { color: theme.text }
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

    const navigation = useNavigation<any>();

    const search = useCallback(async (reset = false) => {
        if (reset) {
            setLoading(true);
            setPage(0);
            setHasMore(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const skip = reset ? 0 : page * LIMIT;
            const allMatches = await HymnService.searchHymns(query, selectedBookId || undefined).fetch();
            const sliced = allMatches.slice(skip, skip + LIMIT);
            const data = sliced;

            if (reset) {
                setResults(data);
            } else {
                setResults(prev => [...prev, ...data]);
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
    }, [query, selectedBookId, page]);

    useEffect(() => {
        const delay = query === '' ? 0 : 500;
        const timeout = setTimeout(() => search(true), delay);
        return () => clearTimeout(timeout);
    }, [query, selectedBookId]);

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
            <View style={[styles.header, { backgroundColor: theme.background }]}>
                <Text style={[styles.title, { color: theme.text }]}>Search</Text>
            </View>

            <View style={[styles.stickyHeader, { backgroundColor: theme.background }]}>
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
                        {hymnBooks.map(book => (
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
                    renderItem={({ item }) => (
                        <HymnRow
                            hymn={item}
                            onPress={() => navigation.navigate('HymnDetail', { hymnId: item.id })}
                        />
                    )}
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
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No results found</Text>
                        </View>
                    }
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    contentContainerStyle={styles.list}
                />
            )}
            <FloatingSearchButton
                visible={showFloatingSearch}
                onPress={handleFloatingSearchPress}
            />
        </View>
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
        fontWeight: 'bold',
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
        borderRadius: 20,
        borderWidth: 1,
    },
    pillText: {
        fontSize: 14,
        fontWeight: '600',
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

export const SearchScreen = withObservables([], () => ({
    hymnBooks: HymnService.getHymnBooks(),
}))(SearchScreenComponent);
