import { Model } from '@nozbe/watermelondb';
import { field, children } from '@nozbe/watermelondb/decorators';

export default class HymnBook extends Model {
    static table = 'hymn_books';

    static associations = {
        hymns: { type: 'has_many', foreignKey: 'hymn_book_id' },
    } as const;

    @field('title') title!: string;
    @field('thumbnail_path') thumbnailPath?: string;
    @field('hymn_count') hymnCount?: number;

    @children('hymns') hymns!: any; // Type as Relation<Hymn> if using TS strict
}
