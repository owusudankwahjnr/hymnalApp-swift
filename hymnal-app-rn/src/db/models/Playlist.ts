import { Model } from '@nozbe/watermelondb';
import { field, children } from '@nozbe/watermelondb/decorators';

export default class Playlist extends Model {
    static table = 'playlists';

    static associations = {
        playlist_items: { type: 'has_many', foreignKey: 'playlist_id' },
    } as const;

    @field('title') title!: string;
    @field('is_custom') isCustom!: boolean;
    @field('cover_url') coverUrl?: string;

    @children('playlist_items') items!: any;
}
