import { database } from './index';
import Hymn from './models/Hymn';
import HymnBook from './models/HymnBook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const SEEDED_VERSION_KEY = 'DB_SEEDED_VERSION_LYRICS_TEST_5';

export const seedDatabase = async () => {
    // Get current app version
    const currentVersion = Constants.expoConfig?.version || '1.0.0';
    
    // Get the version that last seeded the database
    const seededVersion = await AsyncStorage.getItem(SEEDED_VERSION_KEY);
    
    console.log(`[Seed] Current version: ${currentVersion}, Last seeded: ${seededVersion || 'never'}`);
    
    // Check if we need to re-seed
    if (seededVersion === currentVersion) {
        console.log('[Seed] Database already seeded for this version. Skipping.');
        return;
    }

    console.log('[Seed] New version detected or first launch. Seeding database...');
    try {
        const data = require('../assets/hymnal_data.json');

        await database.write(async () => {
            // Fetch existing records to clear them
            const existingBooks = await database.get<HymnBook>('hymn_books').query().fetch();
            const existingHymns = await database.get<Hymn>('hymns').query().fetch();

            // Store pinned status of existing books to preserve user settings
            const pinnedBookIds = new Set(
                existingBooks.filter(book => book.isPinned).map(book => book.id)
            );

            const bookDeletions = existingBooks.map(book => book.prepareDestroyPermanently());
            const hymnDeletions = existingHymns.map(hymn => hymn.prepareDestroyPermanently());

            // Batch insert books
            const bookCreations = data.books.map((book: any, index: number) =>
                database.get<HymnBook>('hymn_books').prepareCreate(record => {
                    record._raw.id = book.id; 
                    record.title = book.title;
                    record.thumbnailPath = book.thumbnail_path;
                    record.hymnCount = book.hymn_count;
                    
                    if (existingBooks.length === 0) {
                        // Fresh install: pin the first book to show the feature
                        record.isPinned = index === 0;
                    } else {
                        // Re-seed: preserve user's previous preference (handles "nothing pinned" correctly)
                        record.isPinned = pinnedBookIds.has(book.id);
                    }
                })
            );

            // Batch insert hymns
            const hymnCreations = data.hymns.map((hymn: any) =>
                database.get<Hymn>('hymns').prepareCreate(record => {
                    record._raw.id = hymn.id; // Use existing ID
                    record.title = hymn.title;
                    record.number = hymn.number;
                    record.hymnBookId = hymn.hymn_book_id;
                    record.variantKey = hymn.variant_key;
                    record.content = JSON.stringify(hymn.content);

                    // Demo lyrics for testing
                    if (hymn.id === 'be3106e9-ba3a-4a39-a73c-7c3d92653cf5') {
                        console.log('[Seed] REMOVING THIS LOG: Injecting lyrics for hymn 366');
                        record.lyrics = JSON.stringify([
                            { time: 2, text: "How shall the young secure their hearts" },
                            { time: 6, text: "and guard their lives from sin?" },
                            { time: 10, text: "Your Word, O LORD, the truth imparts" },
                            { time: 14, text: "to keep the conscience clean." },
                            { time: 18, text: "Your Word is like a heav'nly light" },
                            { time: 22, text: "that guides us all the day," },
                            { time: 26, text: "and through the dangers of the night" },
                            { time: 30, text: "a lamp to lead our way." }
                        ]);
                    }
                })
            );

            // Execute all changes in one large batch (avoiding spread to prevent callstack warning)
            await database.batch([
                ...bookDeletions,
                ...hymnDeletions,
                ...bookCreations,
                ...hymnCreations
            ]);
        });

        // Store the current version as seeded
        await AsyncStorage.setItem(SEEDED_VERSION_KEY, currentVersion);
        console.log(`[Seed] Database seeded successfully with version ${currentVersion}`);
    } catch (error) {
        console.error('[Seed] Error seeding database:', error);
    }
};
