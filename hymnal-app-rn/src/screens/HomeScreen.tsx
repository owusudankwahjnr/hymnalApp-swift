import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput } from 'react-native';
import withObservables from '@nozbe/with-observables';
import { HymnService } from '../services/HymnService';
import { CategoryTile } from '../components/CategoryTile';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { SearchBar } from '../components/SearchBar';
import { FloatingSearchButton } from '../components/FloatingSearchButton';
import { SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import HymnBook from '../db/models/HymnBook';

interface Props {
    books: HymnBook[];
    navigation: any;
    loading: boolean; // Added loading prop
}

const HomeScreenComponent: React.FC<Props> = ({ books, navigation, loading }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFloatingSearch, setShowFloatingSearch] = useState(false);
    const searchInputRef = useRef<TextInput>(null);
    const { theme } = useSettings();

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBookPress = (book: HymnBook) => {
        navigation.navigate('HymnList', {
            hymnBookId: book.id,
            hymnBookTitle: book.title,
        });
    };

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowFloatingSearch(offsetY > 100); // Show after scrolling down 100px
    };

    const handleFloatingSearchPress = () => {
        searchInputRef.current?.focus();
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.header, { backgroundColor: theme.background }]}>
                    <Text style={[styles.title, { color: theme.text }]}>Hymnals</Text>
                </View>
                <View style={{ padding: SPACING.m }}>
                    <SkeletonLoader width="100%" height={40} style={{ marginBottom: SPACING.l }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <SkeletonLoader width="48%" height={150} />
                        <SkeletonLoader width="48%" height={150} />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.background }]}>
                <Text style={[styles.title, { color: theme.text }]}>Hymnals</Text>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
                <SearchBar
                    ref={searchInputRef}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search hymn books..."
                />
            </View>

            <FlatList
                data={filteredBooks}
                renderItem={({ item }) => (
                    <CategoryTile
                        book={item}
                        onPress={() => handleBookPress(item)}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                key={2} // Force fresh render when numColumns changes (though it's static here)
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            />
            <FloatingSearchButton
                visible={showFloatingSearch}
                onPress={handleFloatingSearchPress}
            />
        </View>
    );
};

const enhance = withObservables([], () => ({
    books: HymnService.getHymnBooks(),
}));

export const HomeScreen = enhance(HomeScreenComponent);

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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: SPACING.m,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
});
