import { Q } from '@nozbe/watermelondb';
import { database } from '../db';
import Hymn from '../db/models/Hymn';
import HymnBook from '../db/models/HymnBook';

export const HymnService = {
    getHymnBooks: () => {
        return database.get<HymnBook>('hymn_books').query(
            Q.sortBy('is_pinned', Q.desc),
            Q.sortBy('title', Q.asc)
        );
    },

    togglePin: async (book: HymnBook) => {
        await database.write(async () => {
            await book.update((b) => {
                b.isPinned = !b.isPinned;
            });
        });
    },

    getHymns: (bookId: string) => {
        return database.get<Hymn>('hymns').query(
            Q.where('hymn_book_id', bookId),
            Q.sortBy('number', Q.asc)
        );
    },

    getHymn: (id: string) => {
        return database.get<Hymn>('hymns').findAndObserve(id);
    },

    searchHymns: (query: string, bookId?: string) => {
        const sanitizedQuery = Q.sanitizeLikeString(query);
        const searchCondition = Q.or(
            Q.where('title', Q.like(`%${sanitizedQuery}%`)),
            Q.where('number', Q.like(`${sanitizedQuery}%`))
        );

        const conditions: any[] = [searchCondition];

        let sortColumn = 'title';

        if (bookId) {
            conditions.push(Q.where('hymn_book_id', bookId));
            sortColumn = 'number';
        }

        return database.get<Hymn>('hymns').query(
            ...conditions,
            Q.sortBy(sortColumn, Q.asc)
        );
    },

    searchHymnsDeep: (query: string, bookId?: string) => {
        const sanitizedQuery = Q.sanitizeLikeString(query);
        const searchCondition = Q.where('content', Q.like(`%${sanitizedQuery}%`));

        const conditions: any[] = [searchCondition];

        if (bookId) {
            conditions.push(Q.where('hymn_book_id', bookId));
        }

        return database.get<Hymn>('hymns').query(
            ...conditions,
            Q.sortBy('title', Q.asc)
        );
    },

    getVariants: (variantKey: string) => {
        return database.get<Hymn>('hymns').query(
            Q.where('variant_key', variantKey)
        );
    }
};
