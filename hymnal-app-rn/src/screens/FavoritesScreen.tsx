import React, { useState, useRef } from 'react';
import { View, FlatList, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { getHymnMatchType } from '../utils/hymnUtils';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import { database } from '../db';
import Hymn from '../db/models/Hymn';
import { HymnRow } from '../components/HymnRow';
import { SearchBar } from '../components/SearchBar';
import { SPACING } from '../constants/theme';
import { useFavorites } from '../context/FavoritesContext';
import { useSettings } from '../context/SettingsContext';
import { AdBannerWrapper } from '../components/AdBannerWrapper';

interface Props {
    hymns: Hymn[];
}

const FavoritesScreenComponent: React.FC<Props & { favorites: string[] }> = ({ hymns, favorites }) => {
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<TextInput>(null);
    const { theme } = useSettings();

    // Sort hymns based on the order in favorites array (reversed for latest first)
    const sortedHymns = [...hymns].sort((a, b) => {
        const indexA = favorites.indexOf(a.id);
        const indexB = favorites.indexOf(b.id);
        return indexB - indexA; // Descending order of index (latest added has higher index)
    });

    let filteredHymns = sortedHymns.filter(hymn =>
        hymn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hymn.number.toString().includes(searchQuery)
    );

    let isDeepSearch = false;
    if (filteredHymns.length === 0 && searchQuery.trim().length > 0) {
        filteredHymns = sortedHymns.filter(hymn => {
            const matchType = getHymnMatchType(hymn, searchQuery);
            return !!matchType;
        });
        if (filteredHymns.length > 0) {
            isDeepSearch = true;
        }
    }

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY < -80) {
            searchInputRef.current?.focus();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.background }]}>
                <Text style={[styles.title, { color: theme.text }]}>Favorites</Text>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
                <SearchBar
                    ref={searchInputRef}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search favorites..."
                />
            </View>

            <FlatList
                data={filteredHymns}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    let matchType: 'verse' | 'chorus' | undefined;
                    if (isDeepSearch) {
                        matchType = getHymnMatchType(item, searchQuery);
                    }
                    return (
                        <HymnRow
                            hymn={item as any}
                            onPress={() => navigation.navigate('HymnDetail', { hymnId: item.id })}
                            matchType={matchType}
                        />
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        {!searchQuery && (
                            <>
                                <View style={[styles.emptyIconContainer, { backgroundColor: `${theme.primary}15` }]}>
                                    <Ionicons name="heart-outline" size={48} color={theme.primary} />
                                </View>
                                <Text style={[styles.emptyTitle, { color: theme.text }]}>No Favorites Yet</Text>
                                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                    Search for your favorite hymns
                                </Text>
                                <TouchableOpacity
                                    style={[styles.searchButton, { backgroundColor: theme.primary }]}
                                    onPress={() => (navigation as any).navigate('Search')}
                                >
                                    <Ionicons name="search" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.searchButtonText}>Search Hymns</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {searchQuery && (
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No matches found</Text>
                        )}
                    </View>
                }
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.list}
            />
            <AdBannerWrapper />
        </View>
    );
};

const enhance = withObservables([], () => {
    // We need to access the favorites context outside of the HOC or pass it in.
    // However, withObservables works best with props or database queries.
    // Since favorites are in Context (AsyncStorage), we can't easily query DB directly in the enhance function based on Context without passing it as a prop.
    // BUT, we can wrap the component in a wrapper that gets context and passes it to the enhanced component.
    return {};
});

// Wrapper to bridge Context -> Props -> Observables
const FavoritesScreenWrapper = () => {
    const { favorites } = useFavorites();
    const Enhanced = withObservables(['favorites'], ({ favorites }: { favorites: string[] }) => ({
        hymns: database.get<Hymn>('hymns').query(Q.where('id', Q.oneOf(favorites)))
    }))(FavoritesScreenComponent);

    return <Enhanced favorites={favorites} />;
};

export const FavoritesScreen = FavoritesScreenWrapper;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.m,
        paddingBottom: SPACING.s,
    },
    searchContainer: {
        paddingHorizontal: SPACING.m,
        paddingBottom: SPACING.s,
        zIndex: 1,
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
    },
    list: {
        paddingBottom: 100,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: SPACING.s,
        textAlign: 'center',
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        borderRadius: 12,
        marginTop: SPACING.l,
    },
    searchButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
