import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from './schema';
import { migrations } from './migrations';
import Hymn from './models/Hymn';
import HymnBook from './models/HymnBook';
import Playlist from './models/Playlist';
import PlaylistItem from './models/PlaylistItem';

const adapter = new SQLiteAdapter({
    schema,
    migrations,
    // (You might want to comment out migrationEvents for production)
    // migrationEvents: !!__DEV__,
    onSetUpError: error => {
        // Database failed to load -- offer the user to reload the app or log out
        console.error('Database failed to load', error);
    }
});

export const database = new Database({
    adapter,
    modelClasses: [
        Hymn,
        HymnBook,
        Playlist,
        PlaylistItem,
    ],
});
