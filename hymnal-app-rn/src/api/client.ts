import { Platform } from 'react-native';
import { Hymn, HymnBook, HymnSummary } from '../types';

const DEV_API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const BASE_URL = `http://${DEV_API_HOST}:8000/api/v1/hymnal`;

export const api = {
    async fetchHymnBooks(): Promise<HymnBook[]> {
        const response = await fetch(`${BASE_URL}/hymn_books`);
        if (!response.ok) throw new Error('Failed to fetch hymn books');
        return response.json();
    },

    async searchHymns(query: string, hymnBookId?: string, skip = 0, limit = 20): Promise<HymnSummary[]> {
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
        });
        if (query) params.append('title', query);
        if (hymnBookId) params.append('hymn_book_id', hymnBookId);

        const response = await fetch(`${BASE_URL}/search?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to search hymns');
        return response.json();
    },

    async fetchHymn(id: string): Promise<Hymn> {
        const response = await fetch(`${BASE_URL}/hymns/${id}`);
        if (!response.ok) throw new Error('Failed to fetch hymn');
        return response.json();
    },

    async fetchVariants(id: string): Promise<HymnSummary[]> {
        const response = await fetch(`${BASE_URL}/hymns/${id}/variants`);
        if (!response.ok) throw new Error('Failed to fetch variants');
        return response.json();
    },
};
