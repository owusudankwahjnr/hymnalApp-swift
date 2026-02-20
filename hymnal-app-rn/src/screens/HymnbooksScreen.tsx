import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Layout } from '../components/Layout';
import { useSettings } from '../context/SettingsContext';
import { Ionicons } from '@expo/vector-icons';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const HymnbooksScreen = () => {
    const navigation = useNavigation<any>();
    const database = useDatabase();
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);
    const [books, setBooks] = useState<any[]>([]);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const fetchedBooks = await database.get('hymn_books').query().fetch();
                setBooks(fetchedBooks);
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };
        fetchBooks();
    }, []);

    const BookItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.bookItem, { borderColor: palette.border, backgroundColor: palette.surface }]}
            onPress={() => navigation.navigate('HymnList', {
                hymnBookId: item.id,
                hymnBookTitle: item.title,
            })}
            activeOpacity={0.85}
        >
            <View style={[styles.bookCover, { borderColor: palette.border, backgroundColor: palette.surfaceMuted }]}>
                {item.thumbnailPath ? (
                    <Image source={{ uri: item.thumbnailPath }} style={styles.bookImage} />
                ) : (
                    <Ionicons name="book" size={26} color={palette.textMuted} />
                )}
            </View>
            <View style={styles.bookInfo}>
                <Text style={[styles.bookTitle, { color: palette.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.bookSubtitle, { color: palette.textMuted }]} numberOfLines={1}>
                    {item.hymnCount || 0} Hymns
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
        </TouchableOpacity>
    );

    return (
        <Layout variant="library">
            <View style={styles.screen}>
                <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                    <Text style={[styles.headerTitle, { color: palette.text }]}>Hymnbooks</Text>
                    <Text style={[styles.headerSubtitle, { color: palette.textMuted }]}>Browse hymn texts and collections</Text>
                </View>

                <TouchableOpacity
                    style={[styles.searchFab, { top: Math.max(insets.top, 16), backgroundColor: palette.surface }]}
                    onPress={() => navigation.navigate('Search')}
                    activeOpacity={0.9}
                >
                    <Ionicons name="search" size={20} color={palette.text} />
                </TouchableOpacity>

                <FlatList
                    data={books}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <BookItem item={item} />}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 34,
        fontFamily: MUSIC_FONTS.display,
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: MUSIC_FONTS.body,
        marginTop: 6,
    },
    listContent: {
        paddingTop: 4,
        paddingBottom: 120,
    },
    searchFab: {
        position: 'absolute',
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    bookItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        marginHorizontal: 16,
        marginBottom: 10,
    },
    bookCover: {
        width: 60,
        height: 60,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        marginRight: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookImage: {
        width: '100%',
        height: '100%',
    },
    bookInfo: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
    },
    bookSubtitle: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.body,
        marginTop: 4,
    },
});
