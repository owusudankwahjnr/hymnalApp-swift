import { schemaMigrations, addColumns, createTable } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
    migrations: [
        {
            toVersion: 6,
            steps: [
                addColumns({
                    table: 'hymn_books',
                    columns: [
                        { name: 'is_pinned', type: 'boolean' },
                    ],
                }),
            ],
        },
        {
            toVersion: 7,
            steps: [
                createTable({
                    name: 'playlists',
                    columns: [
                        { name: 'title', type: 'string' },
                        { name: 'is_custom', type: 'boolean' },
                        { name: 'cover_url', type: 'string', isOptional: true },
                    ],
                }),
                addColumns({
                    table: 'hymn_books',
                    columns: [
                        { name: 'artist', type: 'string', isOptional: true },
                        { name: 'description', type: 'string', isOptional: true },
                        { name: 'genre', type: 'string', isOptional: true },
                    ],
                }),
                addColumns({
                    table: 'hymns',
                    columns: [
                        { name: 'audio_url', type: 'string', isOptional: true },
                        { name: 'duration', type: 'number', isOptional: true },
                        { name: 'artist', type: 'string', isOptional: true },
                        { name: 'album_art', type: 'string', isOptional: true },
                    ],
                }),
            ],
        },
        {
            toVersion: 8,
            steps: [
                addColumns({
                    table: 'hymns',
                    columns: [
                        { name: 'lyrics', type: 'string', isOptional: true },
                    ],
                }),
            ],
        },
        {
            toVersion: 9,
            steps: [
                createTable({
                    name: 'playlist_items',
                    columns: [
                        { name: 'playlist_id', type: 'string', isIndexed: true },
                        { name: 'hymn_id', type: 'string', isIndexed: true },
                        { name: 'order', type: 'number' },
                    ],
                }),
            ],
        },
    ],
});
