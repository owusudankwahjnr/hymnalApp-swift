import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
    version: 3,
    tables: [
        tableSchema({
            name: 'hymn_books',
            columns: [
                { name: 'title', type: 'string' },
                { name: 'thumbnail_path', type: 'string', isOptional: true },
                { name: 'hymn_count', type: 'number', isOptional: true },
            ],
        }),
        tableSchema({
            name: 'hymns',
            columns: [
                { name: 'title', type: 'string' },
                { name: 'number', type: 'number' },
                { name: 'hymn_book_id', type: 'string', isIndexed: true },
                { name: 'variant_key', type: 'string', isOptional: true, isIndexed: true },
                { name: 'content', type: 'string' }, // JSON string of HymnContent
            ],
        }),
    ],
});
