import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';

export default class PlaylistItem extends Model {
    static table = 'playlist_items';

    static associations = {
        playlists: { type: 'belongs_to', key: 'playlist_id' },
        hymns: { type: 'belongs_to', key: 'hymn_id' },
    } as const;

    @field('playlist_id') playlistId!: string;
    @field('hymn_id') hymnId!: string;
    @field('order') order!: number;

    @relation('playlists', 'playlist_id') playlist!: any;
    @relation('hymns', 'hymn_id') hymn!: any;
}
