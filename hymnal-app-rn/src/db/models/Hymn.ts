import { Model } from '@nozbe/watermelondb';
import { field, relation, json } from '@nozbe/watermelondb/decorators';
import HymnBook from './HymnBook';

const sanitizeContent = (raw: any) => {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
};

export default class Hymn extends Model {
    static table = 'hymns';

    static associations = {
        hymn_books: { type: 'belongs_to', key: 'hymn_book_id' },
    } as const;

    @field('title') title!: string;
    @field('number') number!: number;
    @field('hymn_book_id') hymnBookId!: string;
    @field('variant_key') variantKey?: string;
    @field('content') content!: string; // Stored as JSON string

    @relation('hymn_books', 'hymn_book_id') hymnBook!: any; // Type as Relation<HymnBook>

    get parsedContent() {
        try {
            return JSON.parse(this.content);
        } catch (e) {
            return { verses: [] };
        }
    }
}
