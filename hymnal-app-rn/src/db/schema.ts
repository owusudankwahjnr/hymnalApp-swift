import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
    version: 9,
    tables: [
        tableSchema({
            name: 'hymn_books',
            columns: [
                { name: 'title', type: 'string' },
                { name: 'thumbnail_path', type: 'string', isOptional: true },
                { name: 'hymn_count', type: 'number', isOptional: true },
                { name: 'is_pinned', type: 'boolean' },
                { name: 'artist', type: 'string', isOptional: true },
                { name: 'description', type: 'string', isOptional: true },
                { name: 'genre', type: 'string', isOptional: true },
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
                { name: 'audio_url', type: 'string', isOptional: true },
                { name: 'duration', type: 'number', isOptional: true },
                { name: 'artist', type: 'string', isOptional: true },
                { name: 'album_art', type: 'string', isOptional: true },
                { name: 'lyrics', type: 'string', isOptional: true }, // JSON string of [{time: number, text: string}]
            ],
        }),
        tableSchema({
            name: 'playlists',
            columns: [
                { name: 'title', type: 'string' },
                { name: 'is_custom', type: 'boolean' },
                { name: 'cover_url', type: 'string', isOptional: true },
            ],
        }),
        tableSchema({
            name: 'playlist_items',
            columns: [
                { name: 'playlist_id', type: 'string', isIndexed: true },
                { name: 'hymn_id', type: 'string', isIndexed: true },
                { name: 'order', type: 'number' },
            ],
        }),
    ],
});
