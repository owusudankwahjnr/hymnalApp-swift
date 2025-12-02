import { database } from './index';
import Hymn from './models/Hymn';
import HymnBook from './models/HymnBook';

export const seedDatabase = async () => {
    const booksCount = await database.get<HymnBook>('hymn_books').query().fetchCount();

    if (booksCount > 0) {
        console.log('Database already seeded.');
        return;
    }

    console.log('Seeding database...');
    try {
        // Require the JSON file directly. 
        // Note: In a real app, you might want to use expo-file-system if the file is huge, 
        // but for a bundled asset, require is easiest if it's not too large.
        const data = require('../assets/hymnal_data.json');

        await database.write(async () => {
            // Batch insert books
            const bookCreations = data.books.map((book: any) =>
                database.get<HymnBook>('hymn_books').prepareCreate(record => {
                    record._raw.id = book.id; // Use existing ID
                    record.title = book.title;
                    record.thumbnailPath = book.thumbnail_path;
                    record.hymnCount = book.hymn_count;
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
                })
            );

            await database.batch(...bookCreations, ...hymnCreations);
        });

        console.log('Database seeded successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};
